import React from "react";
import set from "lodash/fp/set";
import { Field } from "redux-form";
import Table from "react-table";
import * as BS from "react-bootstrap";
import initialData from "./dataFactory";
import FormProvider from "./FormProvider";
import { avatarColumnProps } from "./AvatarCell";
import ActionsCell from "./ActionsCell";
import HighlightCell from "./HighlightCell";
import GridFilters from "./GridFilters";
import faker from "faker"

export default class App extends React.Component {
  state = { data: initialData, editing: null };

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
  ];

  addNew = () => {
    const person = {
      // id: this.state.data.length + 1,
      email: 'AAABenny@Jets.com', // randomPerson.email,
      phone: '0-776-420-9999', // randomPerson.phone,
      name: 'Aaabacab' // randomPerson.name
    }
    const newPeople = [...this.state.data, person].sort(
      (a, b) => a.email < b.email ? -1 : 1)

    this.setState({ data: newPeople })
//   const person = { id: i, ...faker.helpers.contextualCard() }
//   console.log(person.name,person.email,person.phone)
//   data.push(person)
// }

  }

  handleSubmit = values => {
    console.log("handle submit!")
    this.setState(state => {
      const index = this.state.data.indexOf(this.state.editing);
      return {
        data: set(`[${index}]`, values, state.data)
      };
    });
  };

  render() {
    return (
      <React.Fragment>
        <h1>react-table inline editing</h1>
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
              );
            }}
          </FormProvider>
        </BS.Panel>
      </React.Fragment>
    );
  }
}
