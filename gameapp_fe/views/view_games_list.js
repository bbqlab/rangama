<div class='panel_header'>
  <a href='request_player' id='request_player_button' class='button right'>New game</a>
  <a href='settings' class='button left'>Settings</a>
</div>
<div class='panel_content'>

  <div class='box'>
    <h3>Your turn</h3>
    <ul id='running_games'>
      {{#games.running}}
        {{> game_row}}
      {{/games.running}}
   </ul>
  </div>

  <div class='box'>
    <h3>Opponent turn</h3>
    <ul id='opponent_games'>
      {{#games.running_opponent}}
        {{> game_row}}
      {{/games.running_opponent}}
   </ul>
  </div>

  <div class='box'>
    <h3>Topten</h3>
    <ul id='topten'>
      {{#games.topten}}
        {{> game_row}}
      {{/games.topten}}
   </ul>
  </div>

  <div class='box'>
    <h3>Completed games</h3>
    <ul id='completed_games'>
      {{#games.completed}}
        {{> game_row}}
      {{/games.completed}}
   </ul>
  </div>

</div>
