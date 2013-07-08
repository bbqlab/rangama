<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/*

--
-- Struttura della tabella `games`
--

CREATE TABLE IF NOT EXISTS `games` (
  `gamesId` int(11) NOT NULL AUTO_INCREMENT,
  `player1` int(11) NOT NULL,
  `player2` int(11) NOT NULL,
  `score` text NOT NULL,
  `date` datetime NOT NULL,
  `state` varchar(15) NOT NULL,
  `turn` int(11) NOT NULL,
  PRIMARY KEY (`gamesId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


*/

class Games extends BaseEntity
{
  var $gamesId;
  var $player1;
  var $player2;
  var $score1;
  var $score2;
  var $date;
  var $state;
  var $turn;
  var $words;

  public function init()
  {
    $this->player1 = '';
    $this->player2 = '';
    $this->score1 = -1;
    $this->score2 = -1;
    $this->date = date("Y-m-d H:i:s");
    $this->state = 'pending';
    $this->turn = 1;

    $this->words = $this->random_words();
  }

  public function random_words()
  {
    $pool = array();
    $anagram = new Anagrams();
    while(count($pool) < 100) {
      $id = rand(0, $anagram->count());
      if(!in_array($id, $pool)) {
        $ana = new Anagrams($id);
        $pool[] = array(
          'anagramsId' => $ana->anagramsId,
          'length' => count($ana->word),
          'distance' => $ana->distance
        );
      }
    }
    
    return $pool;
  }

  public function get_words($limit, $offset)
  {
    $words = array();
    GameApp::log($limit . ' --- '. $offset);
    for ($i = $offset; $i < $limit + $offset; $i++) {
      $anagram = new Anagrams($this->words[$i]->anagramsId);

      $words[] = array('word'=> $anagram->word, 
                       'anagram' =>  $anagram->anagram);
    }

    return $words;
  }

  public function checkRecords($user,$score)
  {
    $ret = array('is_personal_record'=> false, 'is_topten_record' => false);

    // check if is topten record
    $query = $this->db->query("SELECT player, MAX(score) AS score FROM ranking " .
                              "GROUP BY player HAVING score > 0 " .
                              "ORDER BY score DESC limit 10;");
    $games = $query->result();
    foreach($games as $game)
    {
      if($user->usersId==$game->player AND $game->score==$score)
      {
        $ret['is_topten_record'] = true;
        break;
      }
    }

    if( $ret['is_topten_record'] ) return $ret;

    // check if it is personal record
    $query = $this->db->query("SELECT MAX(score) personal_record FROM ranking WHERE player=" . $user->usersId);
    $personal_record = $query->result();

    if($personal_record[0]->personal_record==$score)
      $ret['is_personal_record']=true;

    return $ret;
  }

  public function getTopTen()
  {
    $topten = array();
    $query = $this->db->query("SELECT player, MAX(score) AS score FROM ranking " .
                              "GROUP BY player HAVING score > 0 " .
                              "ORDER BY score DESC limit 10;");

    $games = $query->result();

    foreach($games as $game)
    {
      $player = new Users($game->player);
      $topten[] = array('image' => $player->image,
                        'player' => $player->username, 
                        'score' => $game->score);
    }

    return $topten;
  }

  public function add_player($user)
  {
    $queue = new Queue();
    $gameInfo = $queue->pop($user->usersId);
    $this->load($gameInfo->gamesId);
    $this->player2 = $user->usersId;
    $this->state = 'running';
    $this->save();
    $gameInfo->delete();
  }

  public function new_game($user)
  {
    $queue = new Queue();
    $this->init();
    $this->player1 = $user->usersId;
    $this->save();
    $queue->push($user, $this->gamesId);
  }

  public function getRole($user)
  {
    if($this->player1 == $user->usersId)
    {
      return 1;
    }

    return 2;
  }

  public function setScore($user, $score)
  {
    $role = $this->getRole($user);
    $scoreLabel = 'score' . $role;
    $this->$scoreLabel = $score;
    
    if($this->score1 >= 0 and $this->score2 >= 0)
    {
      $this->state = 'completed';
    }

    $this->save();
  }

  public function serializeScore()
  {
  }

  public function deserializeScore()
  {
  }
}
