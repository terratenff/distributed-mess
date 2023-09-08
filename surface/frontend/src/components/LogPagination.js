import { useState, useEffect, useRef } from "react";
import { Table, Pagination, PaginationItem, PaginationLink } from 'reactstrap';

/**
 * Produces a table with pagination.
 * @param {*} urlPrefix Base url, from which data entries are collected.
 * They must have the properties "timestamp" and "description".
 * @param {*} limit Determines how many data entries are in a page. Defaults to 10,
 * which is used on the back-end.
 * @returns LogPagination component.
 */
function LogPagination({ urlPrefix, limit = 10 }) {

    /**
     * Fetches up to a fixed number of mission events from the application and updates the component with them.
     * The fixed number is based on the value defined in the back-end.
     */
    async function fetchData() {
        const fetchedData = await (await fetch(urlPrefix + "?page=" + page.current)).json();
        setData(fetchedData);
    }

    /**
     * Determines the current total for mission events, and uses that to determine the number of pages
     * for the mission event pagination component.
     */
    async function getDataCount() {
        const fetchedData = await (await fetch(urlPrefix)).json();
        setPageCount(Math.ceil(fetchedData.length / limit));
    }

    /**
     * Moves the mission event pagination component to the specified index and updates the component accordingly.
     * @param {*} target Target pagination index.
     */
    async function movePagination(target) {
        if (target >= 0 && target < pageCount) {
            page.current = target;
            fetchData();
        }
    }

    /**
     * Generates a list of pagination indices that are presented for the user to navigate to.
     * @param {*} currentIndex Pagination index that the user is currently on.
     * @param {*} pageCount Number of pages that are available. 
     * @returns Pagination indices that are limited to range [max(currentIndex - 3, 0), min(currentIndex + 3, pageCount)].
     */
    function generatePaginationIndices(currentIndex, pageCount) {
        let iMin = currentIndex - 3;
        let iMax = currentIndex + 3;
        if (iMin < 0) {
            iMin = 0;
        }
        if (iMax > pageCount) {
            iMax = pageCount;
        }

        let paginationIndices = [];
        for (let i = iMin; i < iMax; i++) {
            paginationIndices.push(i);
        }

        return paginationIndices;
    }

    const [data, setData] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const initialized = useRef(false);
    const page = useRef(0);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            getDataCount();
            fetchData();
        }
    });

    const contents = data.map((entry) => {
        return (
            <tr key={entry.id}>
                <td>{entry.timestamp}</td>
                <td>{entry.description}</td>
            </tr>
        );
    });

    const paginationIndices = generatePaginationIndices(page.current, pageCount);
    const paginationCore = paginationIndices.map(i => {
        let active = {"active": page.current === i};
        return (
            <PaginationItem {...active} key={i}>
                <PaginationLink onClick={() => movePagination(i)}>{i + 1}</PaginationLink>
            </PaginationItem>
        );
    });
    const pagination = (
        <Pagination size="lg" style={{display: "flex", justifyContent: "center"}}>
            <PaginationItem>
                <PaginationLink first onClick={() => movePagination(0)}/>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink previous onClick={() => movePagination(page.current - 1)}/>
            </PaginationItem>
            {paginationCore}
            <PaginationItem>
                <PaginationLink next onClick={() => movePagination(page.current + 1)}/>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink last onClick={() => movePagination(pageCount - 1)}/>
            </PaginationItem>
        </Pagination>
    );

    return (
        <>
            {pagination}
            <Table borderless hover style={{textAlign: "left"}}>
                <thead>
                <tr>
                    <th width="20%">Timestamp</th>
                    <th width="80%">Description</th>
                </tr>
                </thead>
                <tbody>
                    {contents}
                </tbody>
            </Table>
        </>
    );
}

export default LogPagination;
