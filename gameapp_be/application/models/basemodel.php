<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class BaseModel extends CI_Model{


  function __construct($id=Null)
  {
    parent::__construct();
    if($id)
      $this->load($id);
  }

  function update($data)
  {
    $table = strtolower(get_class($this));
    $this->db->update($table,$data,"id = {$this->id}");
  }

  function save()
  {
    $table = strtolower(get_class($this));
    $this->db->ignore();
    $this->db->insert($table,$this); 
    $this->id = $this->db->insert_id();
    return $this->id;
  }


  function load($id)
  {
    $table = strtolower(get_class($this));
    $query = $this->db->get_where($table,array('id'=>$id),1);
    $result = $query->row();
    $properties = get_object_vars($this);
    foreach($properties as $name => $value)
      if(isset($result->$name))
        $this->$name=$result->$name;
  }

  function remove($id=Null)
  {
    $table = strtolower(get_class($this));
    if($id!==Null)
      $this->db->delete($table,array('id'=>$id));
    else
      $this->db->delete($table,array('id'=>$this->id));
  }

  function search($select=null,$condition=null,$limit=null,$offset=null,$group_by=null,$order_by=null)
  {
    $table = strtolower(get_class($this));
    if($select!=null)
      $this->db->select($select,false);
    if($group_by!=null)
      $this->db->group_by($group_by);
    if($order_by!=null)
      $this->db->order_by($order_by);
    $query = $this->db->get_where($table,$condition,$limit,$offset);
    $ret = $query->result_array();
    $query->free_result();
    return $ret;
  }

}
