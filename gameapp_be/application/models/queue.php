<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/*

--
-- Struttura della tabella `queue`
--

CREATE TABLE IF NOT EXISTS `queue` (
  `queueId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `timestamp` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

*/

class Queue extends BaseEntity
{
  var $queueId;
  var $usersId;
  var $timestamp;

  public function push($user, $gamesId)
  {
    $gameInfo = new Queue();
    $gameInfo->usersId = $user->usersId;
    $gameInfo->gamesId = $gamesId;
    $gameInfo->timestamp = date('Y-m-d H:i:s');
    $gameInfo->save();
  }

  public function pop($usersId)
  { 
    $info = $this->search(array('usersId != ' => $usersId),
                          1,'');
    if(count($info) > 0)
    {
      $queueInfo = new Queue();
      foreach($info[0] as $key => $value)
      {
        $queueInfo->$key = $value;
      }
      return $queueInfo;
    }


    return false;
  }

  public function count($usersId)
  {
    $query = $this->db->query('select count(*) as total from queue '.
                               "where usersId != '$usersId'");
    $data = $query->result_array();
    Wodrs::log($data);
    return $data[0]['total'];
  }
}
