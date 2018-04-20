import * as React from 'react';
import {Card, CardBody, CardHeader} from 'reactstrap';
import {Col, Row, FormGroup, Label, Input, Table} from 'reactstrap';
import InputField from './InputField';
import FormFieldGroups from './FormFieldGroups';
import FormFieldGroup from './FormFieldGroup';

class FormFields extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        const props = this.props;
        const fields = this.props.fields;
        return fields.layout.map((field:any, index:number) => {
            if(field.fields === 'br') {
                return <br key={"br_" + index} />
            } else if(field.fields === 'hr') {
                return <hr key={"hr_" + index}  />
            } else {
                return <Row key={'ffs_' + index } >
                    <FormFieldGroups {...field} 
                            defaults={fields.defaults} />
                </Row>
            }
        });
    }
}
export default FormFields;

