import React from 'react';
import './App.css';

function App() {

  const [response, setResponse] = React.useState<string>('');

  const onFetch = React.useCallback(()=> {

    fetch('https://url/api/token')
    .then((response) => response.json())
    .then((data) => setResponse(JSON.stringify(data)));

  } ,[]);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {response}
        </p>
        <button onClick={onFetch} style={{ color: 'black'}}>
          Api Fetch
        </button>
      </header>
    </div>
  );
}

export default App;
