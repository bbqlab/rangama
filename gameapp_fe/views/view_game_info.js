
<div class='panel_header'>
    {{#equal game.state 'running'}}
      {{#equal game.score1 -1}}
        <a class='button right' href='start_game/{{game.gamesId}}'>PLAY!</a>
      {{/equal}}
    {{/equal}}
    <a class='button left' href='show_game_list'>Back</a>
</div>


<div class='panel_content'>
  <div class='box'>
    <h3>
     {{#equal game.score1 -1}}Your turn!{{/equal}}
     {{#equal game.score2 -1}}Opponent turn!{{/equal}}
    </h3>
    <ul>
    <li style='position:relative' class='wrapper'>
 <span class='avatar right'>
   <div class='player_avatar player2_avatar'>
     <img src='{{game.player2_img}}'>
   </div>
   <div class='player_name player2_name'>
     {{game.player2}}
   </div>
 </span>

 <span class='avatar left'>
   <div class='player_name player1_name'>
     {{game.player1}}
   </div>
   <div class='player_avatar player1_avatar'>
     <img src='{{game.player1_img}}'>
   </div>
 </span>

 <span class='game_score'>
   {{#equal game.score1  -1}}
     <span>X</span>
   {{/equal}}

   {{#notequal game.score1 -1}}
     <span>{{game.score1}}</span>
   {{/notequal}}
    -
   {{#equal game.score2  -1}}
     <span>X</span>
   {{/equal}}

   {{#notequal game.score2 -1}}
     <span>{{game.score2}}</span>
   {{/notequal}}
 </span>


    <div style='clear:both'></div>
  </li>
  </ul>
  </div>
</div>

