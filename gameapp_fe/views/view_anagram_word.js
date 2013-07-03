
<ul id='anagram_word' class='sortable'>
  {{#each word}}
    <li id='item{{@index}}' class='letter l{{@index}}'>{{this}}</li>
  {{/each}}
</ul>
