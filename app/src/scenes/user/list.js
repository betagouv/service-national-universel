import React, { useEffect, useState } from "react";
import { Container, Table, Modal, ModalHeader, ModalBody, Button, Row, Col, FormGroup, Input } from "reactstrap";
import { useHistory } from "react-router-dom";
import { Formik } from "formik";
import { toastr } from "react-redux-toastr";

import LoadingButton from "../../components/loadingButton";
import api from "../../services/api";
import { translate } from "../../utils";

export default () => {
  const [users, setUsers] = useState(null);
  const history = useHistory();
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    (async () => {
      const { users: u } = await api.get("/user");
      setUsers(u);
    })();
  }, [refresh]);

  if (!users) return <div>Chargement...</div>;

  return (
    <div>
      <Container style={{ padding: "40px 0" }}>
        <Create onChange={() => setRefresh(true)} />
        <Table hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last Login</th>
            </tr>
          </thead>
          <tbody>
            {users.map(({ _id, name, email, lastLoginAt, role }) => {
              return (
                <tr onClick={() => history.push(`/admin/user/${_id}`)}>
                  <td>{name}</td>
                  <td>{email}</td>
                  <td>{role}</td>
                  <td>{(lastLoginAt || "").slice(0, 10)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Container>
    </div>
  );
};

const Create = ({ onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginBottom: 10, textAlign: "right" }}>
      <Button color="primary" size="sm" onClick={() => setOpen(true)}>
        Create user
      </Button>
      <Modal isOpen={open} toggle={() => setOpen(false)} size="lg">
        <ModalHeader toggle={() => setOpen(false)}>Create user</ModalHeader>
        <ModalBody>
          <Formik
            initialValues={{ name: "", role: "normal", password: "", email: "" }}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const res = await api.post("/user", values);
                if (!res.ok) throw res;
                toastr.success("Created!");
                onChange();
                setOpen(false);
              } catch (e) {
                console.log(e);
                toastr.error("Erreur !", translate(e.code));
              }
              setSubmitting(false);
            }}
          >
            {({ values, handleChange, handleSubmit, isSubmitting }) => (
              <React.Fragment>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <div>Name</div>
                      <Input name="name" value={values.name} onChange={handleChange} />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <div>Email</div>
                      <Input name="email" value={values.email} onChange={handleChange} />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <div>Role</div>
                      <Input type="select" name="role" value={values.role} onChange={handleChange}>
                        <option value="normal">Normal</option>
                        <option value="admin">Admin</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <div>Password</div>
                      <Input name="password" value={values.password} onChange={handleChange} />
                    </FormGroup>
                  </Col>
                </Row>
                <br />
                <LoadingButton loading={isSubmitting} color="info" onClick={handleSubmit}>
                  Save
                </LoadingButton>
              </React.Fragment>
            )}
          </Formik>
        </ModalBody>
      </Modal>
    </div>
  );
};
