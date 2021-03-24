import React, { useEffect, useState } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
import { Col, Row } from "reactstrap";

export default ({ componentId = "FILTER", young, targetLocation }) => {
  return <ReactiveComponent componentId={componentId} render={(data) => <SubComponent young={young} targetLocation={targetLocation} {...data} />} />;
};

const SubComponent = ({ setQuery, young, targetLocation }) => {
  const [distance, setDistance] = useState("50");

  useEffect(() => {
    (async () => {
      const query = {
        bool: {
          must: {
            match_all: {},
          },
        },
      };
      let location;
      if (targetLocation === "relative") location = await getCoordinates({ q: young.mobilityNearRelativeAddress, postcode: young.mobilityNearRelativeZip });
      else location = young.location || (await getCoordinates({ q: young.city }));
      if (location) {
        query.bool["filter"] = {
          geo_distance: {
            distance: `${distance}km`,
            location,
          },
        };
      }
      setQuery({ query });
    })();
  }, [distance, targetLocation]);

  const getCoordinates = async ({ q, postcode }) => {
    try {
      let url = `https://api-adresse.data.gouv.fr/search/?q=${q || postcode}`;
      if (postcode) url += `&postcode=${postcode}`;
      const res = await fetch(url).then((response) => response.json());
      const lon = res?.features[0]?.geometry?.coordinates[0] || null;
      const lat = res?.features[0]?.geometry?.coordinates[1] || null;
      return lon && lat && { lat, lon };
    } catch (e) {
      console.log("error", e);
      return null;
    }
  };

  const handleChangeDistance = (e) => setDistance(e.target.value);

  return (
    <>
      <Row>
        <Col md={12}>
          <select id="distance" className="form-control" value={distance} onChange={handleChangeDistance}>
            <option value="" disabled>
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
