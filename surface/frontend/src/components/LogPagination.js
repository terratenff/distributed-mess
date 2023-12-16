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

    const INDEX_COUNT = 5;

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
        const newPageCount = Math.ceil(fetchedData.length / limit);
        if (newPageCount !== pageCount) {
            setPageCount(newPageCount);
        }
    }

    /**
     * Moves the mission event pagination component to the specified index and updates the component accordingly.
     * @param {*} target Target pagination index.
     */
    async function movePagination(target) {
        if (target >= 0 && target < pageCount) {
            page.current = target;
        }
        fetchData();
        getDataCount();
    }

    /**
     * Generates a list of pagination indexes that are presented for the user to navigate to.
     * @param {*} currentIndex Pagination index that the user is currently on.
     * @param {*} pageCount Number of pages that are available. 
     * @returns Up to 5 pagination indexes that surround current index.
     */
    function generatePaginationIndices(currentIndex, pageCount) {
        let iMin = currentIndex - Math.floor(INDEX_COUNT / 2);
        let iMax = currentIndex + Math.ceil(INDEX_COUNT / 2);
        if (iMin < 0) {
            iMax += Math.abs(iMin);
            iMin = 0;
        }
        if (iMax > pageCount) {
            iMin -= iMax - pageCount;
            iMin = Math.max(0, iMin);
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
                <PaginationLink onClick={() => movePagination(i)} style={{width: "100px"}}>{i + 1}</PaginationLink>
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

    const table = data.length === 0 ? <></> : (
        <Table borderless hover style={{textAlign: "left", height: "500px"}}>
            <thead>
            <tr style={{verticalAlign: "top"}}>
                <th width="20%">Timestamp</th>
                <th width="80%">Description</th>
            </tr>
            </thead>
            <tbody>
                {contents}
            </tbody>
        </Table>
    );

    return (
        <>
            {pagination}
            {table}
        </>
    );
}

export default LogPagination;
