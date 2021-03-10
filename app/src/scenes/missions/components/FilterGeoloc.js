import React, { useEffect, useState } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
import { Col, Row } from "reactstrap";

export default ({ componentId = "FILTER", location }) => {
  return <ReactiveComponent componentId={componentId} render={(data) => <SubComponent location={location} {...data} />} />;
};

const SubComponent = ({ setQuery, location = "Paris" }) => {
  const [distance, setDistance] = useState("");

  useEffect(() => {
    (async () => {
      const query = {
        bool: {
          must: {
            match_all: {},
          },
        },
      };
      if (location) {
        !distance && setDistance("50");
        query.bool["filter"] = {
          geo_distance: {
            distance: `${distance}km`,
            location,
          },
        };
      } else {
        setDistance("");
      }
      setQuery({ query });
    })();
  }, [distance]);

  const handleChangeDistance = (e) => setDistance(e.target.value);

  return (
    <>
      <Row>
        <Col md={12}>
          <select id="distance" className="form-control" value={distance} onChange={handleChangeDistance}>
            <option value="" disabled selected>
              Rayon de recherche maximum
            </option>
            <option value="2">Distance max. 2km</option>
            <option value="5">Distance max. 5km</option>
            <option value="10">Distance max. 10km</option>
            <option value="20">Distance max. 20km</option>
            <option value="50">Distance max. 50km</option>
            <option value="100">Distance max. 100km</option>
          </select>
        </Col>
      </Row>
    </>
  );
};
