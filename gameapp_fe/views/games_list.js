<div class='panel_header'>
  <a href='request_player' id='request_player_button' class='button right'>New game</a>
  <a href='settings' id='settings_button' class='settings left'></a>
</div>
<div class='panel_content'>

      <div class='box'>
        <h3>Your turn</h3>
        <ul id='running_games'>
  <% 
  if(games.running.length > 0) { %>
         <% for(game in games.running) { %>
            <%=$.template('view_game_row', {game: games.running[game]})%>
         <% } %>
  <% 
    }
  %>
          <li style='color:#333;'>
            <a href='start_game/-1'>
              <span class='center'>Train yourself!</span>
            </a>
          </li>
        </ul>
      </div>
  <%
  
    if(games.running_opponent.length > 0) { %>
      <div class='box'>
        <h3>Opponent turn</h3>
        <ul id='opponent_games'>
         <% for(game in games.running_opponent) { %>
           <%=$.template('view_game_row', 
                         {game: games.running_opponent[game]})%>
         <%}%>
        </ul>
      </div>
  <%
    }


   if(games.topten.length > 0) { %>
      <div class="box">
        <h3>Top ten</h3>
        <ul id='topten'>
        <% for(score in games.topten) { %>
          <%=$.template('view_topten_row', 
                        {score: games.topten[score], pos: (parseInt(score) + 1)})%>
        <%}%>
        </ul>
      </div>
  <% 
    }

   if(games.completed.length > 0) { %>
      <div class="box">
        <h3>Completed</h3>
        <ul id='completed_games'>
         <% for(game in games.completed) { %>
           <%=$.template('view_game_row', 
                         {game:games.completed[game]})%>
         <%}%>
        </ul>
      </div>
  <% 
    }
  %>
</div>
