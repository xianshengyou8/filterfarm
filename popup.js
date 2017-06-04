
//test 111
// 判斷FB登入狀態及取得登入資訊
if (localStorage.accessToken) {
  var d = new Date();
  var timestampForToken = d.getTime();
  //console.log(timestampForToken);
  if (timestampForToken < localStorage.expire) {
    var graphUrl = "https://graph.facebook.com/me?" + localStorage.accessToken + "&fields=id,name";
    //console.log(graphUrl);
    var x = new XMLHttpRequest();
    x.open('GET', graphUrl);
    // The Google image search API responds with JSON, so let Chrome parse it.
    x.responseType = 'json';
    x.onload = function() {
      // Parse and process the response from Google Image Search.
      var response = x.response;
      //console.log('name: '+ response.name);
      if (!response) {
        console.log('No response from facebook graph api!');
        return;
      } else {
        var id = response.id;
        var name = response.name;

        // 判斷是否已登入來決定區塊的顯示及隱藏
        $(document).ready(function() {
          $('#oauth_block').hide();
          $('#user_block').show();
          $('#opinion_block').show();
          $('#user_name').html(name);
        });
      }
    };
    x.onerror = function() {
      console.log('Network error.');
    };
    x.send();
  } else {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('expire');
    onFacebookLogin();
  }
}