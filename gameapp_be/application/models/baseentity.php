<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class BaseEntity extends CI_Model {
  function __construct($id = null)
  {
    parent::__construct();
    if($id)
    { 
      $this->load($id);
    }
  }

  function __call( $method, $param )
  {
    if(substr($method,0,3) == 'set')
    {
      $attribute = lcfirst(substr($method,3));
      $this->$attribute = $param[0];
    }
    elseif(substr($method,0,8) == 'loadFrom')
    {
      $attribute = lcfirst(substr($method,8));
      $this->loadFromAttribute($attribute, $param[0]);
    }
    elseif(substr($method,0,6) == 'exists')
    {
      $attribute = lcfirst(substr($method,6));
      $this->existsAttribute($attribute, $param[0]);
    }
  }

  /*!
   * \brief Get name of the db table where object is stored
   * \return string Name of database table
   */
  function table()
  {
    return strtolower( get_class( $this ) );
  }

  /*!
   * \brief Get name of the db field where object id is stored
   * \return string Name of id database field
   */
  function id()
  {
    return $this->table() . "Id";
  }

  function isValid()
  {
    $id = $this->id();
    return $this->$id != '';
  }



  /*!
   * \brief Search inside a collection of objects
   */
  function search( $conditions, $limit = -1, $offset = -1, $order = '' )
  {
    $this->db->select('*');
    $this->db->from($this->table());


    
    if(is_array($conditions))
    {
      foreach($conditions as $key => $condition)
      {
        if(is_array($condition))
        {
          $this->db->where_in($key, $condition);
        }
        elseif(stristr(substr($key, 0, 3), 'or'))
        {
          $this->db->or_where(array(substr($key, 3) => $condition));
        }
        else
        {
          $this->db->where(array($key => $condition));
        }
      }
    }
    else
    {
      $this->db->where($conditions);
    }
    
    if($limit > 0)
    {
      $this->db->limit($limit );
    }

    if($order != '')
    {
      $this->db->order_by($order[0], $order[1]);
    }

    $query = $this->db->get();
    $result = $query->result();

    return $result;

  }

  function loadWhere( $conditions )
  {
    $this->db->select( '*' );
    $this->db->from($this->table());

    foreach( $conditions as $key => $condition )
    {
      if( is_array( $condition ) )
      {
        $this->db->where_in( $key, $condition );
      }
      else
      {
        $this->db->where( array( $key => $condition ) );
      }
    }
    
    $this->db->limit(1);
    
    $row = $this->db->get()->row();

    return $this->initFromDB( $row );
  }

  function loadFromAttribute( $attribute, $value )
  {
    // TOFIX: use get_where in una sola riga con il limit, 
    // se value == false sostituire con '' ma poi controlla
    // se ci sono dei record restituiti altrimenti torna false
    $this->db->select('*')->from($this->table());
    $this->db->where(array( $attribute => $value ));
    $result = $this->db->get()->row();
    return $this->initFromDB($result);
  }

  function toArray()
  {
    $array = array();

    foreach($this as $key => $value)
    {
      $array[$key] = $value;
    }

    return $array;
  }

  /*!
   * \brief Load an object from database
   * \param id The object id
   */
  function load( $id )
  {
    $where = array( $this->id() => $id );
    $query = $this->db->get_where( $this->table(), $where, 1 );
    $result = $query->row();
    return $this->initFromDB($result);
  }

  /*!
   * \brief Init the object from cleaned post values
   */
  function initFromPost()
  {
    foreach( get_object_vars( $this ) as $var => $value )
    {
      $this->$var = $this->input->post($var);
    }
  }

  /*!
   * \brief Init the object from db result
   */
  function initFromDB( $result )
  {
    if( is_array( $result ) )
    {
      foreach( get_object_vars( $this ) as $var => $value )
      {
        if(isset( $result[$var]))
        {
          $this->$var = $this->check_json($result[$var]);
        }
      }
    }
    else
    {
      foreach( get_object_vars( $this ) as $var => $value )
      {
        if( isset( $result->$var ) )
        {
          $this->$var = $this->check_json($result->$var);
        }
      }
    }
    return $this;
  }

  function check_json($string) 
  {
    $object = json_decode($string);
    return is_array($object)?$object:$string;
  }

  function count() 
  {
    return $this->db->count_all_results($this->table());
  }

  function loadChildren( $childs = NULL, $list = NULL )
  { 
    if($list === NULL)
    {  
      $list = array($this);
    }

    if(count($list) == 0)
    {
      return;
    }

    foreach($childs as $child)
    {
      $this->load->model($child);
    }

    $attributes = get_object_vars($list[0]);

    foreach( $list as $key => $obj )
    {
      foreach($childs as $childClass)
      {
        $sonId = strtolower($childClass) . "Id";
        $son = new $childClass($obj->$sonId);
        $list[$key]->$childClass = $son;
      }
    }

    return $list;
  }

  /*!
   * \brief Store object state in the database. Updating it
   *        if it is present, inserting new one otherwise
   */
  function save()
  {
    $id = $this->id();

    foreach ($this as $attr => $value) {
      if(is_array($value) || is_object($value)) { 
        $this->$attr = json_encode($value);
      }
    }

    GameApp::log($this);

    if( $this->$id == '' ) // insert
    {
      unset($this->$id);
      $this->db->insert( $this->table(), $this );
      $this->$id = $this->db->insert_id();
    }
    else // update
    {
      $temp = $this->$id;
      $attributes = array_keys(get_object_vars($this));

      $this->db->where($id, $this->$id);
      $this->db->update( $this->table(), $this );
      $this->$id = $temp;
    }

    GameApp::log($this->db->last_query());
  }

  function delete()
  {
    $id = $this->id();
    $this->db->delete($this->table(), array($id => $this->$id));
  }
}

/* Location: ./application/models/baseentity.php */
