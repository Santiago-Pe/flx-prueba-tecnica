// UsersPage.js
import { useEffect, useState, useContext } from "react";
import { Button, Select, Space, Table, Tag, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import ApiContext from "../../context/apiContext";
import { UserModalForm, Loader, Show } from "../../components";
import PageFaildFetch from "../errors/pageFaildFetch";

import { useDebounce } from "../../hooks";
import { CloseOutlined } from "@ant-design/icons";
import {
  setCurrentUser,
  setError,
  setLoading,
  setTotalRecords,
  setUsers,
} from "../../reudx/actions/users/userActions";
import { fetchUsers } from "../../services/users/usersServices";

const { Search } = Input;

const UsersPage = () => {
  const dispatch = useDispatch();
  const { client: apiClient } = useContext(ApiContext);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [pagination, setPagination] = useState({ _page: 1, _limit: 10 });
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  const { users, loading, error, total } = useSelector((state) => state.users);

  // Fetch
  const fetchData = async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetchUsers(apiClient, {
        ...filters,
        ...pagination,
      });
      console.log(response.data);
      dispatch(setUsers(response.data));
      dispatch(setTotalRecords(response.totalUsers));
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };
  // Functions
  const onSearch = (value) => {
    setSearchTerm(value);
  };
  const handleFilterChange = (value, key) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      if (value === undefined) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
    setPagination((prevPagination) => ({
      ...prevPagination,
      _page: 1, // Reset current page when filters change
    }));
  };
  const handleTableChange = (pagination) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      _page: pagination.current,
      _limit: pagination.pageSize,
    }));
  };
  const handleModalDelete = () => {
    setDeleteModalVisible((prevState) => !prevState);
  };
  const handleDelete = (user) => {
    dispatch(setCurrentUser(user));
    handleModalDelete();
  };

  // Columns Table
  const columns = [
    {
      title: "Usuario",
      dataIndex: "username",
      key: "username",
      width: "33.33%",
      render: (username) => <span>{username}</span>,
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      width: "33.33%",
      render: (name) => <span>{name}</span>,
    },
    {
      title: "Apellido",
      dataIndex: "lastname",
      key: "lastname",
      width: "33.33%",
      render: (lastname) => <span>{lastname}</span>,
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Activo" : "Inactivo"}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      dataIndex: "actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleDelete(record)} size="small">
            Eliminar
          </Button>
          <Button
            type="link"
            onClick={() => dispatch(setCurrentUser(record))}
            size="small"
          >
            Editar
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination]);

  useEffect(() => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      q: debouncedSearchTerm,
    }));
    setPagination((prevPagination) => ({
      ...prevPagination,
      _page: 1, // Reset current page when filters change
    }));
  }, [debouncedSearchTerm]);

  return (
    <>
      <div className="pageHeader">
        <div className="filterHeader">
          <Search
            size="large"
            placeholder="input search text"
            onSearch={onSearch}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: 300,
            }}
          />
          <Select
            allowClear={{ clearIcon: <CloseOutlined /> }}
            onChange={(value) => handleFilterChange(value, "status")}
            options={[
              { value: "active", label: "Activo" },
              { value: "inactive", label: "Inactivo" },
            ]}
            placeholder="Filtrar por estado"
            size="large"
            style={{
              width: 200,
            }}
          />
        </div>
        <div>
          <UserModalForm useButton callback={fetchData} />
        </div>
      </div>
      <Show>
        <Show.When isTrue={loading}>
          <Loader />
        </Show.When>
        <Show.When isTrue={error}>
          <PageFaildFetch />
        </Show.When>
        <Show.Else>
          <Table
            dataSource={users}
            columns={columns}
            rowKey="id"
            pagination={{
              current: pagination._page,
              pageSize: pagination._limit,
              total: total,
            }}
            onChange={handleTableChange}
          />
          {/* <UsersDeleteForm
            visible={deleteModalVisible}
            callback={fetchData}
            onCancel={handleModalDelete}
          /> */}
        </Show.Else>
      </Show>
    </>
  );
};

export default UsersPage;
