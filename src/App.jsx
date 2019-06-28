import React from "react"
import set from "lodash/fp/set"
import { Field } from "redux-form"
import Table from "react-table"
import * as BS from "react-bootstrap"
import FormProvider from "./FormProvider"
import ActionsCell from "./ActionsCell"
import HighlightCell from "./HighlightCell"
import GridFilters from "./GridFilters"
import axios from 'axios'

const server = 'http://localhost:3005'

export default class App extends React.Component {
  constructor() {
    super()
    this.load()
    this.state = { editing: null}
  }

  load() {
    axios.get(this.request(`/load`))
      .then(response => this.setState({ data: response.data }))
      .catch(error => console.log(`unable to load data, sorry: ${error.toString()}`))
  }

  editableComponent = ({ input, editing, value, ...rest }) => {
    const Component = editing ? BS.FormControl : BS.FormControl.Static;
    const children =
      (!editing && <HighlightCell value={value} {...rest} />) || undefined;
    return <Component {...input} {...rest} children={children} />;
  };

  editableColumnProps = {
    ...GridFilters,
    Cell: props => {
      const editing = this.state.editing === props.original;
      const fieldProps = {
        component: this.editableComponent,
        editing,
        props
      }

      return <Field name={props.column.id} {...fieldProps} />;
    }
  };

  getActionProps = (gridState, rowProps) =>
    (rowProps && {
      mode: this.state.editing === rowProps.original ? "edit" : "view",
      actions: {
        onEdit: () => this.setState({ editing: rowProps.original }),
        onCancel: () => this.setState({ editing: null })
      }
    }) ||
    {};

  columns = [
    {
      Header: "",
      maxWidth: 90,
      filterable: false,
      getProps: this.getActionProps,
      Cell: ActionsCell
    },
    { Header: "Name", accessor: "name", ...this.editableColumnProps },
    { Header: "Email", accessor: "email", ...this.editableColumnProps },
    { Header: "Phone", accessor: "phone", ...this.editableColumnProps }
  ]


  request(path) {
    return `${server}${path}`
  }

  save(people) {
    axios.post(this.request(`/save`), people)
      .then(() => console.log('data saved'))
      .catch(error => console.log(`unable to save data, sorry: ${error.toString()}`))
  }

  addNew = () => {
    const person = {
      email: 'AAABenny@Jets.com',
      phone: '0-776-420-9999',
      name: 'Aaabacab'
    }
    const newPeople = [...this.state.data, person].sort(
      (a, b) => a.email < b.email ? -1 : 1)

    this.save(newPeople)
    this.setState({ data: newPeople })
  }

  handleSubmit = values => {
    this.setState(state => {
      const index = this.state.data.indexOf(this.state.editing);
      const result = {
        data: set(`[${index}]`, values, state.data)
      }
      this.save(result.data)
      return result
    })
  }

  render() {
    return (
      <React.Fragment>
        <h1>Users</h1>
        <BS.Panel bsStyle="primary">
          <BS.Panel.Heading>
            <BS.Clearfix>
              <BS.Button className="pull-right" onClick={this.addNew}>Add New</BS.Button>
            </BS.Clearfix>
          </BS.Panel.Heading>

          <FormProvider
            form="inline"
            onSubmit={this.handleSubmit}
            onSubmitSuccess={() => this.setState({ editing: null })}
            initialValues={this.state.editing}
            enableReinitialize
          >
            {formProps => {
              return (
                <form onSubmit={formProps.handleSubmit}>
                  <Table
                    columns={this.columns}
                    data={this.state.data}
                    defaultPageSize={5}
                  />
                </form>
              )
            }}
          </FormProvider>
        </BS.Panel>
      </React.Fragment>
    );
  }
}
