<% 
  if(game.state=='completed') { 
    if(parseInt(game.score1)>parseInt(game.score2)){ %>
      <li class='game_<%=game.state%> game_won' game_id='<%=game.gamesId%>'>
    <% } else { %>
      <li class='game_<%=game.state%> game_lost' game_id='<%=game.gamesId%>'>
<% } } else {  %>
      <li class='game_<%=game.state%>' game_id='<%=game.gamesId%>'>
<% } %>

<a href='show_game_info/<%=game.gamesId%>'>
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

 <div style='clear:both'></div>
 </a>
</li>
