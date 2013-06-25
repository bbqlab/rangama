
<ul id='anagram_word' class='sortable'>
  <% for (var i = 0; i < word.length; i++) {%>
    <li id='item<%=i%>' class='letter l<%=i%>'><%=word[i]%></li>
  <%};%>
</ul>
