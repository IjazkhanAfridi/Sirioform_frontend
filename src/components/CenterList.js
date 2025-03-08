import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CenterList = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedCenterData, setSelectedCenterData] = useState(null);
  const [sanitarios, setSanitarios] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [allSanitarios, setAllSanitarios] = useState([]);
  const [allInstructors, setAllInstructors] = useState([]);
  const [showSanitarioModal, setShowSanitarioModal] = useState(false);
  const [render, setRender] = useState(false);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [showDeleteCenterModal, setShowDeleteCenterModal] = useState(false);
  const [showAssignedSanitariosModal, setShowAssignedSanitariosModal] =
    useState(false);
  const [showAssignedInstructorsModal, setShowAssignedInstructorsModal] =
    useState(false);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSanitarios, setFilteredSanitarios] = useState(allSanitarios);
  const [filteredInstructors, setFilteredInstructors] =
    useState(allInstructors);
  const [filteredSanitariosData, setFilteredSanitariosData] =
    useState(sanitarios);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredInstructors(
      allInstructors.filter(
        (sanitarios) =>
          sanitarios?.firstName?.toLowerCase()?.includes(query) ||
          sanitarios?.lastName?.toLowerCase()?.includes(query) ||
          sanitarios?.username?.toLowerCase()?.includes(query)
      )
    );
  }, [searchQuery, allInstructors]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredSanitarios(
      allSanitarios?.filter(
        (sanitarios) =>
          sanitarios?.firstName?.toLowerCase().includes(query) ||
          sanitarios?.lastName?.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, allSanitarios]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredSanitariosData(
      sanitarios?.filter(
        (sanitarios) =>
          sanitarios?.firstName?.toLowerCase().includes(query) ||
          sanitarios?.lastName?.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, sanitarios]);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const res = await axios.get('http://172.232.209.245/api/centers');
        setCenters(res.data);
        setFilteredCenters(res.data);
      } catch (err) {
        console.error('Error fetching centers:', err);
      }
    };

    fetchCenters();
  }, []);
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const res = await axios.get(
          `http://172.232.209.245/api/centers/${selectedCenter}`
        );
        setSelectedCenterData(res.data);
      } catch (err) {
        console.error('Error fetching centers:', err);
      }
    };
    if (selectedCenter !== null) {
      fetchCenters();
    }
  }, [selectedCenter, render]);

  const handleAssignSanitario = async (centerId) => {
    setSelectedCenter(centerId);
    try {
      const res = await axios.get('http://172.232.209.245/api/sanitarios');
      setAllSanitarios(res.data);
      setShowSanitarioModal(true);
    } catch (err) {
      console.error('Error fetching sanitarios:', err);
    }
  };

  const handleAddSanitario = (sanitarioId) => {
    if (!sanitarioId) return;
    Swal.fire({
      title: 'Do you want to save the changes?',
      showCancelButton: true,
      confirmButtonText: 'Save',
      denyButtonText: `Don't save`,
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            'http://172.232.209.245/api/centers/assign-sanitario',
            {
              centerId: selectedCenter,
              sanitarioId: sanitarioId,
            },
            {
              headers: {
                'x-auth-token': localStorage.getItem('token'),
              },
            }
          )
          .then((res) => {
            if (res?.status === 200) {
              Swal.fire('Saved!', '', 'success');
              setRender(!render);
            } else {
              Swal.fire('Something went wrong', '', 'info');
            }
          })
          .catch((err) => {
            console.error('Error assigning sanitario:', err);
            Swal.fire('Something went wrong', '', 'info');
          });
      }
    });
  };

  const handleViewSanitarios = async (centerId) => {
    setSelectedCenter(centerId);
    try {
      const res = await axios.get(
        `http://172.232.209.245/api/centers/${centerId}/sanitarios`
      );
      setSanitarios(res.data);
      setShowAssignedSanitariosModal(true);
    } catch (err) {
      console.error('Error fetching assigned sanitarios:', err);
    }
  };

  const handleDeleteCenter = async (centerId) => {
    Swal.fire({
      title: 'Are you sure want to Delete the center?',
      showCancelButton: true,
      confirmButtonText: 'Save',
      denyButtonText: `Don't save`,
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://172.232.209.245/api/centers/${centerId}`, {
            headers: {
              'x-auth-token': localStorage.getItem('token'),
            },
          })
          .then((res) => {
            if (res?.status === 200) {
              Swal.fire('Saved!', '', 'success');
              setRender(!render);
            } else {
              Swal.fire('Something went wrong', '', 'info');
            }
          })
          .catch((err) => {
            console.error('Error assigning sanitario:', err);
            Swal.fire('Something went wrong', '', 'info');
          });
      }
    });
  };

  const handleRemoveSanitario = async (sanitarioId) => {
    Swal.fire({
      title: 'Do you want to Remove Associated Sanatri?',
      showCancelButton: true,
      confirmButtonText: 'Save',
      denyButtonText: `Don't save`,
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            'http://172.232.209.245/api/centers/remove-sanitario',
            {
              centerId: selectedCenter,
              sanitarioId,
            },
            {
              headers: { 'x-auth-token': localStorage.getItem('token') },
            }
          )
          .then((res) => {
            if (res?.status === 200) {
              setSanitarios(sanitarios.filter((s) => s._id !== sanitarioId));
              Swal.fire('Saved!', '', 'success');
            } else {
              Swal.fire('Something went wrong', '', 'info');
            }
          })
          .catch((err) => {
            console.error('Error assigning sanitario:', err);
            Swal.fire('Something went wrong', '', 'info');
          });
      }
    });
  };

  const handleAssignInstructor = async (centerId) => {
    setSelectedCenter(centerId);
    try {
      const res = await axios.get('http://172.232.209.245/api/instructors');
      setAllInstructors(res.data);
      setShowInstructorModal(true);
    } catch (err) {
      console.error('Error fetching instructors:', err);
    }
  };

  const handleAddInstructor = async (instructorId) => {
    if (!instructorId) return;
    Swal.fire({
      title: 'Do you want to Assign Instructor?',
      showCancelButton: true,
      confirmButtonText: 'Save',
      denyButtonText: `Don't save`,
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post('http://172.232.209.245/api/centers/assign-instructor', {
            centerId: selectedCenter,
            instructorId: instructorId,
          })
          .then((res) => {
            if (res?.status === 200) {
              Swal.fire('Saved!', '', 'success');
              setRender(!render);
            } else {
              Swal.fire('Something went wrong', '', 'info');
            }
          })
          .catch((err) => {
            console.error('Error assigning sanitario:', err);
            Swal.fire('Something went wrong', '', 'info');
          });
      }
    });
  };

  const handleViewInstructors = async (centerId) => {
    setSelectedCenter(centerId);
    try {
      const res = await axios.get(
        `http://172.232.209.245/api/centers/${centerId}/instructors`
      );
      setInstructors(res.data);
      setShowAssignedInstructorsModal(true);
    } catch (err) {
      console.error('Error fetching assigned instructors:', err);
    }
  };

  const handleRemoveInstructor = async (instructorId) => {
    Swal.fire({
      title: 'Do you want to remove Assoicaited Instructor?',
      showCancelButton: true,
      confirmButtonText: 'Save',
      denyButtonText: `Don't save`,
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            'http://172.232.209.245/api/centers/remove-instructor',
            {
              centerId: selectedCenter,
              instructorId,
            },
            {
              headers: { 'x-auth-token': localStorage.getItem('token') },
            }
          )
          .then((res) => {
            if (res?.status === 200) {
              Swal.fire('Saved!', '', 'success');
              setInstructors(instructors.filter((i) => i._id !== instructorId));
            } else {
              Swal.fire('Something went wrong', '', 'info');
            }
          })
          .catch((err) => {
            console.error('Error assigning sanitario:', err);
            Swal.fire('Something went wrong', '', 'info');
          });
      }
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filtered = centers.filter((center) => {
      const fullName = `${center?.name || ''}`.toLowerCase();
      const centerName = center?.region?.toLowerCase() || '';
      const searchValue = e.target.value.toLowerCase();

      return fullName.includes(searchValue) || centerName.includes(searchValue);
    });
    setFilteredCenters(filtered);
  };

  return (
    <div className='container mt-4'>
      <div className='d-flex justify-content-between'>
        <h1 className='mb-4'>Lista Centri</h1>
        <div className=''>
          <input
            type='text'
            className='form-control me-2'
            placeholder='Search by center Name and region'
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className='table-responsive'>
        <table className='table table-striped table-bordered'>
          <thead className='thead-dark'>
            <tr>
              <th>Codice Univoco</th>
              <th>Denominazione</th>
              <th>Data Fondazione</th>
              <th>P. Iva</th>
              <th>Indirizzo</th>
              <th>Regione</th>
              <th>Telefono</th>
              <th>Email</th>
              <th>Stato</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredCenters) && filteredCenters?.length > 0 ? (
              filteredCenters.map((center) => (
                <tr key={center._id}>
                  <td>{center.code}</td>
                  <td>{center.name}</td>
                  <td>{center.foundationDate}</td>
                  <td>{center.piva}</td>
                  <td>{center.address}</td>
                  <td>{center.region}</td>
                  <td>{center.phone}</td>
                  <td>{center.email}</td>
                  <td>
                    <button
                      className='btn btn-primary mb-2'
                      onClick={() => handleAssignSanitario(center._id)}
                    >
                      Assegna Sanitario
                    </button>
                    <button
                      className='btn btn-primary mb-2'
                      onClick={() => handleViewInstructors(center._id)}
                    >
                      Istruttori
                    </button>
                    <button
                      className='btn btn-primary mb-2'
                      onClick={() => handleAssignInstructor(center._id)}
                    >
                      Assegna Istruttori
                    </button>
                    <button className='btn btn-primary mb-2'>Abilita</button>
                    <button
                      className='btn btn-danger mb-2'
                      onClick={() => handleDeleteCenter(center?._id)}
                    >
                      Elimina
                    </button>
                    <button
                      className='btn btn-info'
                      onClick={() => handleViewSanitarios(center._id)}
                    >
                      Lista Sanitari
                    </button>
                    <button
                      className='btn btn-primary'
                      onClick={() =>
                        navigate('/admin/update-center', {
                          state: { centerId: center._id },
                        })
                      }
                    >
                      Edit Center
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <>No Data</>
            )}
          </tbody>
        </table>
      </div>
      <button
        className='btn btn-secondary'
        onClick={() => window.history.back()}
      >
        Indietro
      </button>
      

      {/* Modal per Assegnare Sanitario */}
      {showSanitarioModal && (
        <div className='modal modal-xl show d-block' tabIndex='-1'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Assegna Sanitario</h5>
                <button
                  type='button'
                  className='close'
                  onClick={() => setShowSanitarioModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className='modal-body'>
                <input
                  className='form-control mb-3'
                  placeholder='search sanitario'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className='table-responsive'>
                  <table className='table table-striped table-bordered'>
                    <thead className='thead-dark'>
                      <tr>
                        <th>Nome</th>
                        <th>Cognome</th>
                        <th>E-Mail</th>
                        <th>Indirizzo</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSanitarios
                        ?.filter(
                          (item) =>
                            !selectedCenterData?.sanitarios?.some(
                              (center) => center._id === item._id
                            )
                        )
                        .map((sanitarios) => (
                          <tr key={sanitarios._id}>
                            <td>{sanitarios.firstName}</td>
                            <td>{sanitarios.lastName}</td>
                            <td>{sanitarios.email}</td>
                            <td>
                              {sanitarios.address}, {sanitarios.city},{' '}
                              {sanitarios.region}
                            </td>
                            <td>
                              <button
                                type='button'
                                className='btn btn-primary'
                                onClick={() =>
                                  handleAddSanitario(sanitarios?._id)
                                }
                              >
                                Assign
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal per Assegnare Istruttore */}
      {showInstructorModal && (
        <div className='modal modal-xl show d-block' tabIndex='-1'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Assegna Istruttore</h5>
                <button
                  type='button'
                  className='close'
                  onClick={() => setShowInstructorModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className='modal-body'>
                <input
                  className='form-control mb-3'
                  placeholder='search sanitario'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className='table-responsive'>
                  <table className='table table-striped table-bordered'>
                    <thead className='thead-dark'>
                      <tr>
                        <th>Nome</th>
                        <th>Cognome</th>
                        <th>E-Mail</th>
                        <th>brevetNumber</th>
                        <th>Indirizzo</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInstructors
                        ?.filter(
                          (item) =>
                            !selectedCenterData?.instructors?.some(
                              (center) => center === item._id
                            )
                        )
                        ?.map((instructor) => (
                          <tr key={instructor._id}>
                            <td>{instructor.firstName}</td>
                            <td>{instructor.lastName}</td>
                            <td>{instructor.email}</td>
                            <td>{instructor.brevetNumber}</td>
                            <td>
                              {instructor.address}, {instructor.city},{' '}
                              {instructor.region}
                            </td>
                            <td>
                              <button
                                type='button'
                                className='btn btn-primary'
                                onClick={() =>
                                  handleAddInstructor(instructor._id)
                                }
                              >
                                Assegna
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal per Visualizzare Sanitari */}
      {showAssignedSanitariosModal && (
        <div className='modal modal-xl show d-block' tabIndex='-1'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Sanitari Associati</h5>
                <button
                  type='button'
                  className='close'
                  onClick={() => setShowAssignedSanitariosModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className='modal-body'>
                <input
                  className='form-control mb-3'
                  placeholder='search sanitario'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className='table-responsive'>
                  <table className='table table-striped table-bordered'>
                    <thead className='thead-dark'>
                      <tr>
                        <th>Nome</th>
                        <th>Cognome</th>
                        <th>E-Mail</th>
                        <th>Indirizzo</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSanitariosData?.map((sanitarios) => (
                        <tr key={sanitarios._id}>
                          <td>{sanitarios.firstName}</td>
                          <td>{sanitarios.lastName}</td>
                          <td>{sanitarios.email}</td>
                          <td>
                            {sanitarios.address}, {sanitarios.city},{' '}
                            {sanitarios.region}
                          </td>
                          <td>
                            <button
                              type='button'
                              className='btn  btn-danger'
                              onClick={() =>
                                handleRemoveSanitario(sanitarios._id)
                              }
                            >
                              Elimina
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteCenterModal && (
        <div className='modal show d-block' tabIndex='-1'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Delete Center</h5>
                <button
                  type='button'
                  className='close'
                  onClick={() => setShowDeleteCenterModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className='modal-body mx-auto '>
                <h5 className='modal-title py-3'>
                  Are you sure want to Delete
                </h5>
                <div className='d-flex align-items-center gap-3 mx-auto'>
                  <button
                    type='button'
                    className='close  btn-primary'
                    onClick={() => setShowDeleteCenterModal(false)}
                  >
                    <span>Close</span>
                  </button>
                  <button
                    type='button'
                    className='close  btn-danger'
                    onClick={() => handleDeleteCenter(false)}
                  >
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal per Visualizzare Istruttori */}
      {showAssignedInstructorsModal && (
        <div className='modal modal-xl show d-block' tabIndex='-1'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Istruttori Associati</h5>
                <button
                  type='button'
                  className='close'
                  onClick={() => setShowAssignedInstructorsModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className='modal-body'>
                <div className='table-responsive'>
                  <table className='table table-striped table-bordered'>
                    <thead className='thead-dark'>
                      <tr>
                        <th>Nome</th>
                        <th>Cognome</th>
                        <th>E-Mail</th>
                        <th>Telefono</th>
                        <th>Numero Brevetto</th>
                        <th>Codice Fiscale</th>
                        <th>Partita IVA</th>
                        <th>Indirizzo</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {instructors.map((instructor) => (
                        <tr key={instructor._id}>
                          <td>{instructor.firstName}</td>
                          <td>{instructor.lastName}</td>
                          <td>{instructor.email}</td>
                          <td>{instructor.phone}</td>
                          <td>{instructor.brevetNumber}</td>
                          <td>{instructor.piva}</td>
                          <td>{instructor.fiscalCode}</td>
                          <td>
                            {instructor.address},{instructor.city},
                            {instructor.region}
                          </td>
                          <td>
                            <button
                              type='button'
                              className='btn btn-danger btn-sm'
                              onClick={() =>
                                handleRemoveInstructor(instructor._id)
                              }
                            >
                              Elimina
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CenterList;
