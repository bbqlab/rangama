
<div class='panel_header'>
    <% if(game.state=='running' && game.score1==-1) { %>
      <a class='button right' href='start_game/<%=game.gamesId%>'>PLAY!</a>
    <% } %>
    <a class='button left' href='show_game_list'>Back</a>
</div>


<div class='panel_content'>
  <div class='box'>
    <h3>
     <%if(game.score1==-1){%>Your turn!<%}
       else if(game.score2==-1) {%>Opponent turn!<%}
       else if(game.score1>game.score2) {%>You won!<%} 
       else if(game.score2>game.score1) {%>You lose!<%} 
       else {%>Draw!<%}%> 
    </h3>
    <ul>
    <li style='position:relative' class='wrapper'>
 <span class='avatar right'>
   <div class='player_avatar player2_avatar'>
     <img src='<%=game.player2_img%>'>
   </div>
   <div class='player_name player2_name'>
     <%=game.player2%>
   </div>
 </span>

 <span class='avatar left'>
   <div class='player_name player1_name'>
     <%=game.player1%>
   </div>
   <div class='player_avatar player1_avatar'>
     <img src='<%=game.player1_img%>'>
   </div>
 </span>

 <span class='game_score'>
   <%if( game.score1 == -1 ) { %>
     <span>X</span>
   <% } else { %>
     <span><%=game.score1%></span>
   <% } %>
    -
   <%if( game.score2 == -1 ) { %>
     <span>X</span>
   <% } else { %>
     <span><%=game.score2%></span>
   <% } %>
 </span>

    </div>

    <div style='clear:both'></div>
  </li>
  </ul>
  </div>
</div>

