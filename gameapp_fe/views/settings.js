<div class='panel_header'>
    <a class='button right' href='logout'>Logout</a>
    <a class='button left' href='show_game_list'>Back</a>
</div>
<div class='panel_content'>
    <div class='settings_content'>
      <label>
       My avatar:
      </label>
      <div id='avatar_list'>
        <ul>
           <%
             var image_path = 'public/avatars/default.png';
           %>
            <li>
              <img class='wodrs_avatar 
              <% if(settings.user.image == image_path) {%>
                wodrs_avatar_selected
              <%}%>'
              src='<%=image_path%>'>
            </li>
          <% for(var i=1; i<6; i++) { 
            image_path = 'public/avatars/avatar'+i+'.png';
          %>
            <li>
              <img class='wodrs_avatar 
              <% if(settings.user.image == image_path) {%>
                wodrs_avatar_selected
              <%}%>
              ' src='<%=image_path%>'/>
            </li>


          <%}


          if(settings.facebook_user) { 
            image_path = 'http://graph.facebook.com/'+app.facebook_id+'/picture?type=small';
          %>
            <li>
              <img class='wodrs_avatar 
              <% if(settings.user.image == image_path) {%>
                wodrs_avatar_selected
              <%}%>'
              src='<%=image_path%>'>
            </li>
          <%}%>



        </ul>
        <div style='clear:both'></div>
      </div>
    </div>

</div>
