import React, { useEffect, useState } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
import { Col, Container, CustomInput, Input, Row } from "reactstrap";

export default ({ componentId = "FILTER", placeholder }) => {
  return <ReactiveComponent componentId={componentId} render={(data) => <SubComponent placeholder={placeholder} {...data} />} />;
};

const SubComponent = ({ setQuery, placeholder }) => {
  const [city, setCity] = useState("");
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
      if (city) {
        !distance && setDistance("50");
        const location = await getCoordinates(city);
        query.bool["filter"] = {
          geo_distance: {
            distance: `${distance}km`,
            location: location,
          },
        };
      } else {
        setDistance("");
      }
      setQuery({ query });
    })();
  }, [city, distance]);

  const handleChangeCity = (e) => setCity(e.target.value);
  const handleChangeDistance = (e) => setDistance(e.target.value);
  const getCoordinates = async (c) => {
    try {
      let url = `https://api-adresse.data.gouv.fr/search/?q=${c}`;
      const res = await fetch(url).then((response) => response.json());
      const lon = res?.features[0]?.geometry?.coordinates[0] || null;
      const lat = res?.features[0]?.geometry?.coordinates[1] || null;
      return lon && lat && { lat, lon };
    } catch (e) {
      console.log("error", e);
      return null;
    }
  };

  return (
    <>
      <Row>
        <Col md={6}>
          <input id="search" className="form-control" value={city} onChange={handleChangeCity} placeholder={placeholder} />
        </Col>
        <Col md={6}>
          <select disabled={!city} id="distance" className="form-control" value={distance} onChange={handleChangeDistance}>
            <option value="" disabled selected>
              Rayon de recherche maximum
            </option>
            <option value="2">Distance max. 2km</option>
            <option value="5">Distance max. 5km</option>
            <option value="20">Distance max. 20km</option>
            <option value="10">Distance max. 10km</option>
            <option value="50">Distance max. 50km</option>
            <option value="100">Distance max. 100km</option>
          </select>
        </Col>
      </Row>
    </>
  );
};
