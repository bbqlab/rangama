
<div class='panel_score'>
    <span id='score_label'>Score:</span>
    <span id='score_number'><%=game.score%></span>
</div>

<div class='panel_content'>
  <div id='topten_record' class='record_popup'>
    TOPTEN RECORD!
  </div>
  <div id='personal_record' class='record_popup'>
    PERSONAL RECORD!
  </div>
  <div class='padder'>
    <h4 id='results_precision'>Precision: <%=game.precision%></h4>
    <div class='meter'><span id='stats_precision'><span></div><br>

    <h4 id='results_n_key_pressed'>Pressed keys: <%=game.n_key_pressed%></h4>
    <div class='meter'><span id='stats_n_key_pressed'><span></div><br>

    <h4 id='results_n_key_matched'>Matched keys: <%=game.n_key_matched%></h4>
    <div class='meter'><span id='stats_n_key_matched'><span></div><br>

    <%if(game.facebook_user) {%>
    <%}%>

    <a href='show_game_info' class='button center'>Done</a>
  </div>
</div>
