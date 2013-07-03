
{{#equal this.state 'completed'}}
  {{#if this.winner}}
      <li class='game_{{this.state}} game_won' game_id='{{this.gamesId}}'>
  {{/if}}

  {{#unless this.winner}}
      <li class='game_{{this.state}} game_lost' game_id='{{this.gamesId}}'>
  {{/unless}}
{{/equal}} 

{{#notequal this.state 'completed'}}
      <li class='game_{{this.state}}' game_id='{{this.gamesId}}'>
{{/notequal}}

<a href='show_game_info/{{this.gamesId}}'>
 <span class='avatar right'>
   <div class='player_avatar player2_avatar'>
     <img src='{{this.player2_img}}'>
   </div>
   <div class='player_name player2_name'>
     {{this.player2}}
   </div>
 </span>

 <span class='avatar left'>
   <div class='player_name player1_name'>
     {{this.player1}}
   </div>
   <div class='player_avatar player1_avatar'>
     <img src='{{this.player1_img}}'>
   </div>
 </span>

 <span class='game_score'>
   {{#equal this.score1  -1}}
     <span>X</span>
   {{/equal}}

   {{#notequal this.score1 -1}}
     <span>{{this.score1}}</span>
   {{/notequal}}
   -
   {{#equal this.score2  -1}}
     <span>X</span>
   {{/equal}}

   {{#notequal this.score2 -1}}
     <span>{{this.score2}}</span>
   {{/notequal}}
 </span>

 <div style='clear:both'></div>
 </a>
</li>
