/****************************************************
  Scratch Auth Demo by MystPi (github.com/mystpi)

  Learn how to use Scratch Auth (see below) with a
  fun little Express application.

  Live demo: scratch-auth-demo.mystpi.repl.co

  Links:
  - Scratch Auth website: auth.itinerary.eu.org
  - Express.js website: expressjs.com
  - Learn more about JWTs (JSON Web Tokens): jwt.io
  
  MIT licensed
****************************************************/

// Require the dependencies
const express = require('express');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Create a new Express application
const app = express();

// Use the cookie parser so we can read incoming request cookies
app.use(cookieParser());

// Our default cookie options
const cookieOptions = {
  path: '/',                    // Send the cookie to all routes
  httpOnly: true,               // Make the cookie not accessible by document.cookie
  sameSite: 'lax',              // Allow incoming links (but not requests) to include the cookie
  secure: true,                 // Make sure the cookie is secure
  maxAge: 7 * 24 * 3600 * 1000  // The cookie expires in 7 days
};


// The index page is a simple welcome, with a link to /auth
app.get('/', (req, res) => {
  res.send(`
    <h1>Scratch Auth Demo</h1>
    <p>Head to <a href="/auth">/auth</a> to get started.</p>
  `);
});


// The /auth route
app.get('/auth', async (req, res) => {
  let data;
  try {
    // If there is a 'jwt' cookie in the browser, and it is successfully
    // verified, set `data` to its data
    data = jwt.verify(req.cookies.jwt, process.env['SECRET']);
  } catch (e) {
    // If the JWT verification failed it will raise an error which is
    // handled here
    data = null;
  }

  if (data) {
    // This code runs if the JWT verification was successful
    // It uses `name` from the JWT's payload and the JWT token itself
    res.send(`
      <h1>You are signed in as ${data.name}</h1>
      <p>
        Your credentials are stored as a JSON Web Token (JWT) in a
        browser cookie. This means you can refresh your page and
        you'll still be logged in!
      </p>
      <details>
        <summary>
          Click here to see your JWT
        </summary>
        ${req.cookies.jwt}
      </details>
      <p><a href="/logout">Click here</a> to log out.</p>
    `);
  } else {
    if (req.query.privateCode) {
      // If the URL has a `privateCode`, try to verify it with
      // Scratch Auth
      const result = await fetch('https://auth.itinerary.eu.org/api/auth/verifyToken?privateCode=' + req.query.privateCode);
      const json = await result.json();
      if (json.valid) {
        // The verification succeeded! Now we'll create a JWT and store
        // it in the browser cookies
        const token = jwt.sign({ name: json.username }, process.env['SECRET'], { expiresIn: '7 days' });
        res.cookie('jwt', token, cookieOptions);
        res.send(`
          <h1>Yay! You're signed in as ${json.username}!</h1>
          <p>Now you can head to the <a href="/auth">/auth</a> page without having to sign in again.</p>
        `);
      } else {
        // Since the verification failed, we will allow the user to
        // try to authenticate again
        res.send(`
          <h1>Authentication failed. <a href="/auth">Click here to try again.</a></h1>
        `);
      }
    } else {
      // When there is no `privateCode`, send the user to Scratch Auth
      // to try to authenticate. After they're done, they will be sent
      // back to /auth with the private code they recieved as a URL
      // query parameter
      res.redirect(
        'https://auth.itinerary.eu.org/auth/?redirect=' +
        Buffer.from('https://scratch-auth-demo.mystpi.repl.co/auth').toString('base64') +
        '&name=Scratch Auth Demo'
      );
    }
  }
});


// On logout, clear the JWT cookie and redirect back to the index page
app.get('/logout', (req, res) => {
  res.clearCookie('jwt', cookieOptions);
  res.redirect('/');
});


// Add a favicon to the app (taken from Scratch Auth)
app.get('/favicon.ico', (req, res) => {
  res.sendFile(__dirname + '/favicon.svg');
});


// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal server error');
});


// Start the server on port 3000
app.listen(3000, () => {
  console.log('server started');
});
