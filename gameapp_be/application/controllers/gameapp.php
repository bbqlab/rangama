<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class GameApp extends CI_Controller {
	public function index()
	{
		echo "OK";
	}

  public function login()
  {
    $username = $this->input->get('username'); 
    $password = $this->input->get('password'); 

    GameApp::log("Logging in $username");
    GameApp::log("Logging in $password");

    $user = new Users();
    $response = array('error'=> true,
                      'data'=> 'Authentication error');

    $user->loadFromUsername($username);

    if($user->password == $password and $user->isValid())
    {
      $user->token = $this->session->userdata('session_id');
      $user->save();
      $response['error'] = false;
      $response['data'] = array('token'=> $user->token);
    }
    else
    {
      $response['data'] = 'Incorrect username or password';
    }

    $this->response($response);
  }

  public function facebook_login()
  {
    $data = $this->input->get();
    $response = array('error'=> true,
                      'data'=> 'Authentication error');
    GameApp::log('auth fb');
    GameApp::log($data);

    $user = new Users();
    $user->loadFromFacebookId($data['userID']);

    if($user->isValid())  // already registered
    {
      GameApp::log('facebook returning user');
      $user->token = $data['accessToken'];
      $response['error'] = false;
      $response['data'] = array('token'=> $user->token);
    }
    else  // new user
    {
      GameApp::log('facebook new user');
      $user->username = $data['name'];
      $user->password = '';
      $user->image = 'http://graph.facebook.com/'. $data['userID'] .'/picture?type=square';
      $user->email = $data['email'];
      $user->token = $data['accessToken'];
      $user->facebookId = $data['userID'];
      $response['error'] = false;
      $response['data'] = array('token'=> $user->token);
    }

    $user->save();
    $this->response($response);
  }

  public function logout()
  {
    $token = $this->input->get('token'); 
    $user = new Users();
    $user->loadFromToken($token);
    $user->token = '';
    $user->save();

    $this->response(array('error'=> false, 'data'=>''));
  }

  public function register()
  {
    $username = $this->input->get('username'); 
    $password = $this->input->get('password'); 

    $response = array('error'=> true, 'data' => '');

    $user = new Users();
    $user->loadFromUsername($username);

    if($user->usersId == '')
    {
      $user->username = $username;
      $user->password = $password;
      $user->email = '';
      $user->created = date("Y-m-d H:i:s");
      $user->token = $this->session->userdata('session_id');
      $user->save();
      $response['error'] = false;
      $response['data'] = array('token' => $user->token);
    }
    else
    {
      $response['data'] = 'Username already taken';
    }

    $this->response($response);
  }
  
  public function request_player()
  {
    $token = $this->input->get('token'); 
    $response = array('error'=> true, 'data' => '');

    $user = new Users();
    if($user->authenticated($token))
    {
      GameApp::log("Requesting game for " . $user->username);
      $queue = new Queue();
      $game = new Games();

      if($queue->count($user->usersId) > 0)
      {
        GameApp::log('Player found -> ' . $user->usersId);
        // add new player
        $game->add_player($user);

        $response['error'] = false;
        $response['data'] = array('game' => $game);
      }
      else
      {
        GameApp::log('Player not found: enqueue');
        // player in the queue
        $game->new_game($user);

        $response['error'] = false;
        $response['data'] = array('game' => $game);
      }
    }

    $this->response($response);
  }

  public function template()
  {
    $response = array('error' => false, 
                      'data' => array('tpl' => ''));

    GameApp::log('templating');
    $tpl = $this->input->get('name');
    GameApp::log($tpl);
    $this->response($response);
  }

  public function get_words()
  {
    $response = array('error' => false, 
                      'data' => array());
    $token = $this->input->get('token'); 
    $gamesId = $this->input->get('gamesId');
    $limit = $this->input->get('limit');
    $offset = $this->input->get('offset');
    
    $user = new Users();
    if($user->authenticated($token))
    {
      $game = $user->getGame($gamesId);
      if($game)
      {
        $words = $game->get_words($limit, $offset);
        $response['data'] = $words;
      }
    }

    GameApp::log($response);
    
    $this->response($response);
  }

  public function list_games()
  {
    $token = $this->input->get('token'); 
    $games = array(
      'pending' => array(),
      'running' => array(),
      'topten' => array(),
      'running_opponent' => array(),
      'completed' => array()
    );

    $response = array('error' => false, 
                      'data' => array('games' => $games));

    $user = new Users();
    if($user->authenticated($token))
    {
      $games = $user->listGames();

      $game = new Games();

      $games['topten'] = $game->getTopTen();
      GameApp::log($games);
      $response['data'] = array('games' => $games);
    }
    $this->response($response);
  }

  public function get_user_settings()
  {
    $token = $this->input->get('token');
    $response = array('error' => false,
                      'data' => array());

    $user = new Users();
    if($user->authenticated($token))
    {
      $response['data'] = $user->getSettings();
    }
    $this->response($response);
  }

  public function update_avatar()
  {
    $token = $this->input->get('token');
    $url = $this->input->get('url');
    $response = array('error' => true,
                      'data' => array());

    $user = new Users();
    if($user->authenticated($token))
    {
      $user->image = $url;
      $user->save();
    }
    $this->response($response);
  }


  public function send_results()
  {
    $gamesId = $this->input->get('game_id');
    $token = $this->input->get('token');
    $score = $this->input->get('score');

    GameApp::log("Result {$user->username} for $gamesId: $score"); 
    $user = new Users();
    if($user->authenticated($token))
    {
      $game = new Games($gamesId);
      if($game->gamesId != '')
        $completed = $game->setScore($user, $score);
    }

    $response = array('error' => false, 'data' => array());
    $response['data'] = $game->checkRecords($user,$score);
    $this->response($response);
  }

  /* private functions */
  private function response($ret)
  {
    header('Content-Type: application/json');
    if(is_object($ret))
    {
      $dict = array();
      foreach($ret as $key => $value)
      {
        $dict[$key] = $value;
      }
      
      $ret = $dict;
    }

    $content = json_encode($ret);
    header('Content-Length: ' . mb_strlen( $content, 'latin1' ));
    echo $content;
  }

  static function log($message)
  {
    if(is_array($message) or is_object($message))
    {
      $message = print_r($message, true);
    }

    log_message('error',$message);
  }
}

/* End of file game.php */
/* Location: ./application/controllers/wodrs.php */
