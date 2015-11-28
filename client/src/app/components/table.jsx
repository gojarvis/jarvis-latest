const React = require('react');
const Table = require('material-ui/lib/table/table');
const TableBody = require('material-ui/lib/table/table-body');
const TableFooter = require('material-ui/lib/table/table-footer');
const TableHeader = require('material-ui/lib/table/table-header');
const TableHeaderColumn = require('material-ui/lib/table/table-header-column');
const TableRow = require('material-ui/lib/table/table-row');
const TableRowColumn = require('material-ui/lib/table/table-row-column');

const ComposedTable = React.createClass({
  render(){
    this.state = {
      fixedHeader: true,
      fixedFooter: true,
      stripedRows: false,
      showRowHover: false,
      selectable: true,
      multiSelectable: false,
      enableSelectAll: false,
      deselectOnClickaway: true,
      height: '300px',
    };

    return (
      <Table
        height={this.state.height}
        fixedHeader={this.state.fixedHeader}
        fixedFooter={this.state.fixedFooter}
        selectable={this.state.selectable}
        multiSelectable={this.state.multiSelectable}
        onRowSelection={this._onRowSelection}>
        <TableHeader enableSelectAll={this.state.enableSelectAll}>
          <TableRow>
            <TableHeaderColumn colSpan="3" tooltip='Super Header' style={{textAlign: 'center'}}>
              Super Header
            </TableHeaderColumn>
          </TableRow>
          <TableRow>
            <TableHeaderColumn tooltip='The ID'>ID</TableHeaderColumn>
            <TableHeaderColumn tooltip='The Name'>Name</TableHeaderColumn>
            <TableHeaderColumn tooltip='The Status'>Status</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          deselectOnClickaway={this.state.deselectOnClickaway}
          showRowHover={this.state.showRowHover}
          stripedRows={this.state.stripedRows}>
          <TableRow selected={true}>
            <TableRowColumn>1</TableRowColumn>
            <TableRowColumn>John Smith</TableRowColumn>
            <TableRowColumn>Employed</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>2</TableRowColumn>
            <TableRowColumn>Randal White</TableRowColumn>
            <TableRowColumn>Unemployed</TableRowColumn>
          </TableRow>
          <TableRow selected={true}>
            <TableRowColumn>3</TableRowColumn>
            <TableRowColumn>Stephanie Sanders</TableRowColumn>
            <TableRowColumn>Employed</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>4</TableRowColumn>
            <TableRowColumn>Steve Brown</TableRowColumn>
            <TableRowColumn>Employed</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>5</TableRowColumn>
            <TableRowColumn>Joyce Whitten</TableRowColumn>
            <TableRowColumn>Employed</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>6</TableRowColumn>
            <TableRowColumn>Samuel Roberts</TableRowColumn>
            <TableRowColumn>Unemployed</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>7</TableRowColumn>
            <TableRowColumn>Adam Moore</TableRowColumn>
            <TableRowColumn>Employed</TableRowColumn>
          </TableRow>
      </TableBody>
        <TableFooter>
        <TableRow>
          <TableRowColumn>ID</TableRowColumn>
          <TableRowColumn>Name</TableRowColumn>
          <TableRowColumn>Status</TableRowColumn>
        </TableRow>
        <TableRow>
          <TableRowColumn colSpan="3" style={{textAlign: 'center'}}>
            Super Footer
          </TableRowColumn>
        </TableRow>
      </TableFooter>
      </Table>)
  },
})

module.exports = ComposedTable;
