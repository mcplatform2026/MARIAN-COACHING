const React = require('react');
const ReactDOMServer = require('react-dom/server');

try {
  const element = React.createElement('div', { dangerouslySetInnerHTML: { __html: undefined } });
  console.log(ReactDOMServer.renderToString(element));
} catch (e) {
  console.log("CRASH:", e.message);
}
