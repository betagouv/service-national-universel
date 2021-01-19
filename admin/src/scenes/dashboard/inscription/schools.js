import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";

import api from "../../../services/api";

export default ({ filter }) => {
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    (async () => {
      const queries = [];
      queries.push({ index: "young", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": filter.cohort } }] } },
        aggs: { names: { terms: { field: "schoolName.keyword" } } },
        size: 0,
      });

      if (filter.status) queries[1].query.bool.filter.push({ terms: { "status.keyword": filter.status } });
      if (filter.region) queries[1].query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) queries[1].query.bool.filter.push({ term: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery(queries);

      const arr = responses[0].aggregations.names.buckets.map((e) => ({ name: e.key, value: e.doc_count }));
      setSchools(arr);
    })();
  }, [JSON.stringify(filter)]);

  return (
    <TableWrapper>
      <Table>
        <thead>
          <TableHeaderRow>
            <TableHeaderCell>Établissements</TableHeaderCell>
            <TableHeaderCell>Volontaires au sein du département</TableHeaderCell>
            <TableHeaderCell>Volontaires hors du département</TableHeaderCell>
            <TableHeaderCell>Total</TableHeaderCell>
          </TableHeaderRow>
        </thead>
        <tbody>
          {schools.map((e, i) => {
            return (
              <TableRow key={i}>
                <TableCell>{e.name}</TableCell>
                <TableCell>
                  <TableCellContent>
                    <TableCellValue>--</TableCellValue>
                    <TableCellPercentage>--</TableCellPercentage>
                  </TableCellContent>
                </TableCell>
                <TableCell>
                  <TableCellContent>
                    <TableCellValue>--</TableCellValue>
                    <TableCellPercentage>--</TableCellPercentage>
                  </TableCellContent>
                </TableCell>
                <TableCell>
                  <TableCellContent>
                    <TableCellValue>{e.value}</TableCellValue>
                    <TableCellPercentage>--</TableCellPercentage>
                  </TableCellContent>
                </TableCell>
              </TableRow>
            );
          })}
        </tbody>
      </Table>
      {/* <TableLoadMoreWrapper>
        <TableLoadMoreButton>EN VOIR PLUS</TableLoadMoreButton>
      </TableLoadMoreWrapper> */}
    </TableWrapper>
  );
};

// Table
const TableWrapper = styled.div`
  padding: 0 10px;
  border: 1px solid #e2e2ea;
  border-radius: 10px;
  border-spacing: 0 2px;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 2px;
`;
const TableHeaderRow = styled.tr``;
const TableHeaderCell = styled.td`
  padding: 18px 20px;
  color: #696974;
  font-size: 14px;
  text-align: center;

  &:first-child {
    font-size: 16px;
    font-weight: bold;
    text-align: left;
  }
`;
const TableRow = styled.tr`
  background-color: white;
  border-radius: 8px;
`;
const TableCell = styled.td`
  text-align: center;
  padding: 18px 20px;

  :first-child {
    text-align: left;
    font-size: 16px;
    color: #171725;
    font-weight: bold;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }
  :last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  :last-child > div {
    border-right: 0;
  }
`;
const TableCellContent = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid rgba(203, 203, 210, 0.6);
`;
const TableCellValue = styled.strong`
  color: #171725;
  font-weight: bold;
  font-size: 18px;
`;
const TableCellPercentage = styled.span`
  padding: 5px;
  margin-left: 5px;
  display: block;
  border: 1px solid #e0e0e4;
  box-sizing: border-box;
  border-radius: 10px;
  font-size: 14px;
  color: #7c7c7c;
`;
const TableLoadMoreWrapper = styled.div`
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const TableLoadMoreButton = styled.button`
  text-transform: uppercase;
  color: #372f78;
  font-weight: bold;
  font-size: 14px;
  background-color: transparent;
  border: 0;
`;
