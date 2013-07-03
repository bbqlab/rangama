<div class='panel_header'>
  <a href='request_player' id='request_player_button' class='button right'>New game</a>
  <a href='settings' id='settings_button' class='settings left'></a>
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
