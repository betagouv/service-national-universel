import styled from "styled-components";

export const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin-top: 25px;
  align-items: flex-start;
  justify-content: space-between;
`;

export const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 30px;
`;

export const MultiLine = styled.div`
  h2 {
    color: #333;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 5px;
  }
  p {
    color: #718096;
    font-size: 0.75rem;
    margin: 0;
  }
`;

export const ResultTable = styled.div`
  ${({ hide }) => (hide ? "display: none;" : "")}
  background-color: #fff;
  position: relative;
  margin: 20px 0;
  padding-bottom: 10px;
  .pagination {
    display: flex;
    justify-content: flex-end;
    padding: 10px 25px;
    background: #fff;
    margin: 0;
    a {
      background: #f7fafc;
      color: #242526;
      padding: 3px 10px;
      font-size: 12px;
      margin: 0 5px;
    }
    a.active {
      font-weight: 700;
      /* background: #5245cc;
      color: #fff; */
    }
    a:first-child {
      background-image: url(${require("../../assets/left.svg")});
    }
    a:last-child {
      background-image: url(${require("../../assets/right.svg")});
    }
    a:first-child,
    a:last-child {
      font-size: 0;
      height: 24px;
      width: 30px;
      background-position: center;
      background-repeat: no-repeat;
      background-size: 8px;
    }
  }
  select.sort-options {
    background: none; // remove the arrows added by sortOptions
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    outline: 0;
    background-color: #fff;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
    border: 0;
    border-radius: 6px;
    padding: 0.2rem 0.5rem 0.2rem 0.5rem;
    font-size: 0.7rem;
    color: #242526;
    min-width: 150px;
    cursor: pointer;
  }
`;

export const Filter = styled.div`
  padding: 0 25px;
  margin-bottom: 20px;
  .searchbox {
    display: block;
    width: 100%;
    background-color: #fff;
    min-width: 20rem;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
    color: #767676;
    border: 0;
    outline: 0;
    padding: 15px 20px;
    border-radius: 6px;
    margin-right: 15px;
    ::placeholder {
      color: #767676;
    }
  }
  .dropdown-filter {
    button {
      height: 2.5rem;
      background-color: #fff;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
      border: 0;
      border-radius: 6px;
      padding: 10px 20px;
      font-size: 14px;
      color: #242526;
      min-width: 150px;
      margin-right: 15px;
      cursor: pointer;
      div {
        width: 100%;
        overflow: visible;
      }
    }
  }
`;

export const Table = styled.table`
  width: 100%;
  color: #242526;
  margin-top: 10px;
  background-color: #fff;
  th {
    border-top: 1px solid #f4f5f7;
    border-bottom: 1px solid #f4f5f7;
    padding: 15px;
    font-weight: 400;
    font-size: 14px;
    text-transform: uppercase;
  }
  td {
    padding: 15px;
    font-size: 14px;
    font-weight: 300;
    strong {
      font-weight: 700;
      margin-bottom: 5px;
      display: block;
    }
  }
  td:first-child,
  th:first-child {
    padding-left: 25px;
  }
  tbody tr {
    border-bottom: 1px solid #f4f5f7;
    :hover {
      background-color: #f1f1f1 !important;
    }
  }
`;

export const FilterRow = styled.div`
  ${({ visible }) => (!visible ? "display: none;" : "display: flex;")}
  align-items: flex-start;
  flex-wrap: wrap;
  .dropdown-filter {
    margin-right: 15px;
    margin-bottom: 15px;
  }
  button {
    background-color: #fff;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
    border: 0;
    border-radius: 6px;
    padding: 10px 20px;
    font-size: 14px;
    color: #242526;
    min-width: 150px;
    margin-right: 15px;
    cursor: pointer;
    div {
      width: 100%;
      overflow: visible;
    }
  }
`;

export const ResultStats = styled.div`
  position: absolute;
  color: #242526;
  font-size: 12px;
  right: 310px;
`;

export const TopResultStats = styled(ResultStats)`
  top: 15px;
`;

export const BottomResultStats = styled(ResultStats)`
  bottom: 25px;
`;

export const ActionBox = styled.div`
  .dropdown-menu {
    min-width: 0;
    width: 200px;
    a,
    div {
      white-space: nowrap;
      font-size: 14px;
      :hover {
        color: inherit;
      }
    }
  }
  button {
    ${({ color }) => `
      background-color: ${color}15;
      border: 1px solid ${color};
      color: ${color};
    `}
    display: inline-flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    border-radius: 0.5rem;
    padding: 0 0 0 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    outline: 0;
    width: 100%;
    max-width: 250px;
    .edit-icon {
      height: 17px;
      margin-right: 10px;
      path {
        fill: ${({ color }) => `${color}`};
      }
    }
    .down-icon {
      margin-left: auto;
      padding: 7px 15px;
      /* border-left: 1px solid ${({ color }) => `${color}`}; */
      margin-left: 15px;
      svg {
        height: 10px;
      }
      svg polygon {
        fill: ${({ color }) => `${color}`};
      }
    }
  }
  .dropdown-item {
    border-radius: 0;
    background-color: transparent;
    border: none;
    color: #767676;
    white-space: nowrap;
    font-size: 14px;
    padding: 5px 15px;
    font-weight: 400;
    :hover {
      background-color: #f3f3f3;
    }
  }
`;
