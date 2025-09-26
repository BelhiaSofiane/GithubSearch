import { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'
import './App.css'

function App() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  // pagination using react-paginate
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const start = currentPage * itemsPerPage;
  const end = start + itemsPerPage;
  const currentResults = results.slice(start, end);


  async function retryWithBackoff(fn, maxRetries = 5, BaseDelay = 1000) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (e) {
        if (attempt === maxRetries - 1) {
          throw e;
        }
        const delay = BaseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async function fetchUsers(q, page = 1) {
    setCurrentPage(0);
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(q)}&per_page=${10000}&page=${page}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      } else if (res.status === 404) {
        throw new Error("User not found");
      } else if (res.status === 500) {
        throw new Error("Server error");
      }

      const data = await res.json();
      setResults(data.items || []);
      console.log(data);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
      console.error(err);
    }
  }

  return (
    <div>
      <div className='search-field'>
        <label htmlFor="search">Search GitHub Users</label>
        <input
          id="search"
          value={query}
          onChange={(e) => {setQuery(e.target.value)}}
          onKeyDown={(e) => e.key === "Enter" && retryWithBackoff(() => fetchUsers(query))}
          aria-describedby={error ? "error-message" : undefined}
        />
        <button onClick={() => retryWithBackoff(() => fetchUsers(query))}>Search</button>

        {status === "loading" && <div role="status" aria-live="polite">Loading...</div>}
        {status === "error" && (
          <div id="error-message" role="alert">{error}</div>
        )}
        {status === "success" && results.length === 0 && <p>No results found</p>}

        {
          currentResults.map((user) => (
            <li key={user.id} className="result-item">
              <img src={user.avatar_url} alt={`${user.login} avatar`} width={32} height={32} />
              <a href={user.html_url} target="_blank" rel="noreferrer">
                {user.login}
              </a>
            </li>
          ))}

      </div>
      {
        results.length > itemsPerPage && (
          <ReactPaginate
            forcePage={currentPage}
            pageCount={Math.ceil(results.length / itemsPerPage)}
            onPageChange={({ selected }) => setCurrentPage(selected)}
            containerClassName="pagination"
            activeClassName="active"
          />
        )
      }
    </div>
  );
}

export default App

