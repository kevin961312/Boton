var files;
      const CLIENT_ID = '505112869632-tk80cs02qiu800h82cl805aeagru5tfi.apps.googleusercontent.com';
      const API_KEY = 'AIzaSyDFq9km38yz0qnoJjaPY6fskKVaQVfxNB0';

      const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

      const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

      let tokenClient;
      let gapiInited = false;
      let gisInited = false;

      document.getElementById('authorize_button').style.visibility = 'hidden';
      document.getElementById('signout_button').style.visibility = 'hidden';
      document.getElementById('selectNumber').style.visibility = 'hidden';
      
      function gapiLoaded() {
        gapi.load('client', initializeGapiClient);
      }

      async function initializeGapiClient() {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeEnableButtons();
      }

      function gisLoaded() {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              gapi.client.setApiKey(API_KEY);
              gapi.client.load('calendar', 'v3', listUpcomingEvents);
            }
          },
        });
        gisInited = true;
        maybeEnableButtons();
      }

      function maybeEnableButtons() {
        if (gapiInited && gisInited) {
          document.getElementById('authorize_button').style.visibility = 'visible';
        }
      }

      function handleAuthClick() {
        
        tokenClient.callback = async (resp) => {
          if (resp.error !== undefined) {
            throw (resp);
          }
          document.getElementById('signout_button').style.visibility = 'visible';
          document.getElementById('authorize_button').innerText = 'Refresh';
          await listFiles();
        };
        console.log(tokenClient)
        if (gapi.client.getToken() === null) {
          tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
        
          tokenClient.requestAccessToken({prompt: ''});
        }
      }

      function handleSignoutClick() {
        const token = gapi.client.getToken();
        if (token !== null) {
          google.accounts.oauth2.revoke(token.access_token);
          
          gapi.client.setToken('');
          document.getElementById('content').innerText = '';
          document.getElementById('authorize_button').innerText = 'Authorize';
          document.getElementById('signout_button').style.visibility = 'hidden';
        }
      }

      async function listFiles() {
        let response;
        var folderId = '1HzOYyThYB6ELOGmOV00bHVYOYic5DjiN'
        try {
          response = await gapi.client.drive.files.list({
             q: `\'${folderId}' in parents`,
             'fields': 'files(id, name)'
          });
        } catch (err) {
          document.getElementById('content').innerText = err.message;
          return;
        }
        files = response.result.files;
        if (!files || files.length == 0) {
          document.getElementById('content').innerText = 'No files found.';
          return;
        }

        document.getElementById('selectNumber').style.visibility = 'visible';
        
        var select = document.getElementById("selectNumber");

        files.forEach(function(element)
        {
          var opt = element.name;
          var el = document.createElement("option");
          el.textContent = opt;
          el.value = opt;
          select.appendChild(el);
        });
      }

      function generateEle() 
      {
        var element = document.querySelector('#selectNumber');
        var output = element.value;
        var element1 = files.find( file => file.name === output);
        const Iframe = `<iframe frameborder="0" style="width:100%;height:334px;" src="https://viewer.diagrams.net/?highlight=0000FF&nav=1&title=${element1.name}#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D${element1.id}%26export%3Ddownload"></iframe>`
        document.getElementById('content').innerHTML = Iframe;
      }
