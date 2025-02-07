import React, { useRef, useEffect, useState } from 'react';
import { VncScreen } from 'react-vnc';
import axios from 'axios';
import { withCookies } from 'react-cookie';

function App() {
  var ticket = '';
  var csrf = '';
  var vncTicket = '';
  var port = 5900;
  const [autoConnect, setAutoConnect] = useState(false);

  useEffect(() => {
    // Your existing useEffect code
  }, []);

  const get_ticket = () => {
    axios.post('/api2/json/access/ticket', {
      username: "root@pam",
      password: "proxmox"
    })
    .then(function (response) {
      const data = response.data.data;
      console.log(data);
      csrf = (data.CSRFPreventionToken);
      ticket = (data.ticket);
      console.log('Ticket = ', ticket);
      console.log('CSRF = ', csrf);
      document.cookie = `PVEAuthCookie=${encodeURIComponent(ticket)}; path=/;`;
    })
    .catch(function (error) {
      console.log(error);
    });
  };

  const get_ticket_vnc = () => {
    axios.post('/api2/json/nodes/vbox/qemu/100/vncproxy', 
      // CSRFPreventionToken: csrf,
      {websocket: 1,
      // withCredentials: true

      // withCookies: true,

      })
    .then(function (response) {
      console.log(response);
      vncTicket = (response.data.data.ticket); // Assuming the VNC ticket is in response.data.data.ticket
      port = (response.data.data.port); // Assuming the port is in response.data.data.port
    })
    .catch(function (error) {
      console.log(error);
    });
  };

  const handleConnect = () => {
    setAutoConnect(true);
  };

  return (
    <div>
      <button onClick={get_ticket}>Get Ticket</button>
      <button onClick={get_ticket_vnc}>Get VNC Ticket</button>
      <button onClick={handleConnect}>Connect</button>
      <br />
      {/*<button onClick={handleConnect}>Connect</button>*/}
      <VncScreen
        // autoConnect={autoConnect}
        url={`wss://localhost:8006/api2/json/nodes/vbox/qemu/100/vncwebsocket?port=${port}&vncticket=${vncTicket}`}
        // url = '/api2/json/nodes/vbox/qemu/100/vncwebsocket?port=5900&vncticket=PVEVNC:67A1C64F::EMiNMPplsCIIYcWC25c/90xZIDGBqT6dMmuzdm2+f3LO1F3EiT0UJ9R/QzZbr8A4b3CCTXkUVnCUoe2qp2IfVmINAssFIQVHIMk798LUCHX79wRphT2CjTOCurNXjZAcMF4QzolBJCHQ5IA6CON7uGTbfYQd775UsKBDacHRsiEA8JFai4VaKDVRd9yoa368uJbFc+OaWTHzI6EIiD78r9aLTgovpPjmcPzGHrXlTCXIPvZWXtCabhAPHlKoo1Dnzwf4X+zmct20f1VF8NuD5d0cqd2F7787PynVehGt0MvOx4NURFHazjWGWX3gdDy/WdeT1dBvlXlsPapj3Io/AQ=='
        scaleViewport
        background="black"
        retryDuration={1000}
        autoConnect={autoConnect}
        onCredentialsRequired={() => {

        }}
        style={{
          width: '75vw',
          height: '75vh',
        }}
      />
      {/* <iframe src="http://localhost:8006/?console=kvm&novnc=1&vmid=100&vmname=testVM&node=vbox&resize=off" title="Proxmox" style={{ width: '90%', height: '90vh' }} /> */}
    </div>
  );
}

export default App;