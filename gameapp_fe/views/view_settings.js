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
          {{#each settings.available_avatars}}
            <li>
              <img class='wodrs_avatar 
              {{#equal settings.image  this}}
                wodrs_avatar_selected
              {{/equal}}' 
              src='{{this}}'>
            </li>
          {{/each}}

          {{#if settings.facebook_user}}
            <li>
              <img class='wodrs_avatar 
              {{#equal settings.image image_path}}
                wodrs_avatar_selected
              {{/equal}}'
              src='http://graph.facebook.com/{{settings.facebook_id}}/picture?type=small'>
            </li>
          {{/if}}
        </ul>
        <div style='clear:both'></div>
      </div>
    </div>

</div>
