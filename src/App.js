import React, { useRef, useEffect, useState } from 'react';
import { VncScreen } from 'react-vnc';
import axios from 'axios';
import { withCookies } from 'react-cookie';

function App() {
  const [ticket, setTicket] = useState('');
  const [csrf, setCsrf] = useState('');
  const [vncTicket, setVncTicket] = useState('');
  const [cert, setcert] = useState('');
  const [port, setPort] = useState(5900);
  const [autoConnect, setAutoConnect] = useState(false);
  const [connectionstring, setConnectionstring] = useState('');

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
      setCsrf(data.CSRFPreventionToken);
      setTicket(data.ticket);
      console.log('Ticket = ', data.ticket);
      console.log('CSRF = ', data.CSRFPreventionToken);
      document.cookie = `PVEAuthCookie=${encodeURIComponent(data.ticket)}; path=/;`;
    })
    .catch(function (error) {
      console.log(error);
    });
  };

  const get_status = () => {
    axios.get('/api2/json/nodes/vbox/qemu/100/status/current?', {
      headers: {
        // 'CSRFPreventionToken': csrf,
        // 'Cookie': `PVEAuthCookie=${ticket}`
      }
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  const get_ticket_vnc = () => {
    axios.post('/api2/json/nodes/vbox/qemu/100/vncproxy', 
      {
        websocket: 1
      },
      {
        withCredentials: true,
        headers: {
          'CSRFPreventionToken': csrf,
          'Cookie': `PVEAuthCookie=${encodeURIComponent(ticket)}`
        }
      })
    .then(function (response) {
      console.log(response);
      setVncTicket(response.data.data.ticket); // Assuming the VNC ticket is in response.data.data.ticket
      console.log('VNC Ticket = ', response.data.data.ticket);
      setPort(response.data.data.port); // Assuming the port is in response.data.data.port
      console.log('Port = ', response.data.data.port);
      setcert(response.data.data.cert); // Assuming the cert is in response.data.data.cert
      console.log('Cert = ', response.data.data.cert);
      setConnectionstring(`/api2/json/nodes/vbox/qemu/100/vncwebsocket?port=${response.data.data.port}&vncticket=${encodeURIComponent(response.data.data.ticket)}`);
      console.log('Connection String = ', connectionstring);
    })
    .catch(function (error) {
      console.log(error);
    });
  };

  const handleConnect = () => {
  

    setAutoConnect(true);
    console.log('port', port, 'vncTicket', vncTicket);
    axios.get(connectionstring, {}

    ).then(function (response) {
      console.log(response);
    }
  );
  };

  return (
    <div>
      <button onClick={get_ticket}>Get Ticket</button>
      <button onClick={get_ticket_vnc}>Get VNC Ticket</button>
      <button onClick={get_status}>Get Status</button>
      <button onClick={handleConnect}>Connect</button>
      <br />
      {autoConnect && vncTicket && (
        <VncScreen
          url={`ws://localhost:3000${connectionstring}`}
          // ${connectionstring}
          
          background="Gray"
          retryDuration={100}
          style={{
            width: '75vw',
            height: '75vh',
          }}
          onSecurityFailure={() => {
            console.log('Security Failure');
          }}
          
          onConnect={() => {
            console.log('connected');
          }}
          onDisconnect={() => {
            console.log('disconnected');
          }}
          onError={(error) => {
            console.log('error', error);
          }}

        />
      )}
    </div>
  );
}

export default App;