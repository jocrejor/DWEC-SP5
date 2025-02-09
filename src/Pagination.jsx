import React from 'react'
import { object } from 'yup';

function Pagination({itemsPerPage, totalItems, currentPage, setCurrentPage}) {
  const pageNumbers = [];
  const rounded = Math.ceil(totalItems/itemsPerPage);



  for (let i = 1; i <= rounded; i++){
    pageNumbers.push(i); 
  }

  const previuosPage = () => {
    setCurrentPage(currentPage - 1);
  }

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  }

  const specificPage = (page) => {
    setCurrentPage(page);
  }

  return (
    <nav aria-label="Page navigation example" className="d-block" id='pagination'>
      <ul className="pagination justify-content-center">
        <li className="page-item">
          <a className={`page-link text-light-blue ${currentPage === 1 ? 'disabled' : ''}`} onClick={previuosPage} aria-label="Página anterior">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        {pageNumbers.map(page => (
            <li className="page-item" key={page}>
              <a className={`page-link text-light-blue ${page === currentPage ? 'activo-2' : ''}`} onClick={()=> specificPage(page)}>{page}</a>
            </li>
        ))}
        <li className="page-item">
          <a className={`page-link text-light-blue ${currentPage >= pageNumbers.length ? 'disabled' : ''}`} onClick={nextPage} aria-label="Página siguiente">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
  )
}

export default Pagination
