import React, { Component } from 'react';
import Navbar from '../components/Home/Navbar';
import { Link} from 'react-router-dom';
import axios from 'axios';
import {strapi, getUserName,getId} from '../components/functions';
import NotFound from './NotFound';
import Success from './Success';
import { LoggedInContext } from '../contexts/LoggedInContext';
import {withStyles} from '@material-ui/core/styles';
import {Grid, Typography,MenuItem,TextField,Button} from '@material-ui/core';
const modeOfPayment = [
  {
    value: 'gcash',
    label: 'Gcash',
  },
  {
    value: 'paypal',
    label: 'Paypal',
  },
];
const useStyles = theme => ({
  mainStyle:{
    margin:theme.spacing(14),
    height:'auto',
    [theme.breakpoints.down('sm')]:{
      margin:theme.spacing(14,2,8,2),
    }
  },
})
export class CheckOut extends Component {
  //AFTER SENDING THE REQUEST DELETE THE CAMPAIGN
  constructor(props) {
    super(props);
    this.state={
      id:'',
      raised:0,
      title:'',
      currency:'',
      author:'',
      modeOfPayment:'gcash',
      gcash:'',
      paypal:'',
      smartpadala:'',
      reference_id:'checkout-'+Math.floor(Math.random() * 31415926),
      email:'',
      name:'',
      user_id:'',
      requested:false,
      errors:[],
      reload:false,
      isSuccess:false
      
    }
    this.handleOnChange = this.handleOnChange.bind(this)
    this.handeOnSubmit = this.handeOnSubmit.bind(this)
    this.showInput = this.showInput.bind(this)

    this.goBack = this.goBack.bind(this); 
  }

  handeOnSubmit = () => {
    
    this.setState({
      requested:true
    })
    const {id,reference_id,user_id,name,email,modeOfPayment,raised,currency} = this.state
    const data = {
      reference_id,
      campaign_id:id,
      user_id,
      name,
      email,
      mode_of_payment:modeOfPayment,
      amount:raised,
      currency,}
    axios.post(`${strapi}/checkout-requests`,data)
    .then(res=>{
      // console.log(res.data)
      this.setState({
        isSuccess:true
      })
    })
    .catch(err=>{
      alert('You Already Requested a Checkout')
    })
    const requested = {
      requested:true
    }
    axios.put(`${strapi}/campaigns/${this.props.match.params.id}`,requested)
    .then(res=>{console.log(res)})
    .catch(err=>{console.log(err)})
    
  }

  handleOnChange = event => {
    console.log(event)
    this.setState({
      [event.target.name]: event.target.value,
      errors:[]
    })
  }

  showInput = () => {
    switch(this.state.modeOfPayment){
      case 'gcash':
        return(<TextField type='text' name='gcash' value={this.state.gcash} onChange={this.handleOnChange} label='GCASH no.' variant='outlined'/>);
      case 'paypal':
        return(<TextField type='email' name='paypal' value={this.state.paypal} onChange={this.handleOnChange} label='Paypal Email'  variant='outlined'/>);
      case 'smartpadala':
        return(<TextField type='text' name='smartpadala' value={this.state.smartpadala} onChange={this.handleOnChange} label='Smart Padala Agent no.'  variant='outlined'/>);
      default:
        return('');
    }
  }

  formValidation = (event) => {
    event.preventDefault();
    
    switch (this.state.modeOfPayment) {
      case 'gcash':
        this.setState({
          reload:!this.state.reload,
        })
        if (this.state.gcash.length <= 0) {
          if (!this.state.errors.includes('Enter GCASH no.')) {
            this
              .state
              .errors
              .push('Enter GCASH no.')
          }
         
        } else {
          this.setState({
            errors:[]
          })
          this.handeOnSubmit()
        }
        break;
      case 'paypal':
      
        if (this.state.paypal.length <= 0) {
          if (!this.state.errors.includes('Enter Paypal Email')) {
            this
              .state
              .errors
              .push('Enter Paypal Email')
            
          }
          this.setState({
            reload:!this.state.reload
          })
        } else {
          this.setState({
            errors:[]
          })
          this.handeOnSubmit()
        }
        break;
      case 'smartpadala':
        
        if (this.state.paypal.length <= 0) {
          if (!this.state.errors.includes('Enter Smart Padala Agent no.')) {
            this
              .state
              .errors
              .push('Enter Smart Padala Agent no.')
            
          }
          this.setState({
            reload:!this.state.reload
          })
        } else {
          this.setState({
            errors:[]
          })
          this.handeOnSubmit()
        }
        break;
    
      default:
        break;
    }
  }

  componentDidMount(){
    //move to backend
    axios.get(`${strapi}/campaigns/${this.props.match.params.id}`)
    .then(res=>{
      console.log(res.data)
        this.setState({
          raised:res.data.raised,
          id:res.data.id,
        title:res.data.title,
        currency:res.data.currency,
        author:res.data.author.username,
        name:res.data.author.first_name + ' ' + res.data.author.last_name,
        email:res.data.author.email,
        user_id:res.data.author.id,
        gcash:res.data.author.gcash_number,
        paypal:res.data.author.paypal_email,
        })
     
    }).catch(err=>{console.log(err)})
    
    axios.get(`${strapi}/users/${this.state.contextid}`)
      .then(res=>{
        console.log(res.data)
        this.setState({
          paypal:res.data.paypal_email,
          gcash:res.data.gcash_number
        })
      })
      .catch(err=>{
        console.log(err.response)
      })
  }

  goBack(){
    this.props.history.goBack();
}
  
  render() {
    const {classes} = this.props
    const {id,raised,title,currency,author,isSuccess} = this.state;
    return(
<LoggedInContext.Consumer>{(context)=>{
      const {username,id} = context
      this.state.contextid = id;
      if(author === username){
    if (isSuccess) {
      return <Success/>
    } else {
      return (
        <>
          <Navbar/>
          <main className={classes.mainStyle}>
            
          <Grid container>
              <Grid item sm={12}>
              <button onClick={this.goBack} className='btn btn-secondary'>Go Back</button>
              <h1>Checkout</h1>
              <h4>Campaign Title: {title}</h4>
              <h4>Amount: {currency} {raised}</h4>
              {(this.state.errors.length > 0)
          ? <div className="alert alert-danger" role="alert">{this
                .state
                .errors
                .map(error => (
                  <div key={error.id}>{error}</div>
                ))}</div>
          : ''}
          {raised <= -1 ? (
            <h2>You dont have funds</h2>
          ): (
            
            <form onSubmit={this.formValidation}>
              {/* <div className='row my-3'>
              <div className='col-sm-5'>
              <label htmlFor='country'>Mode of Payment:</label>
                <select 
                className="form-control form-control-sm"
                name='modeOfPayment' onChange={this.handleOnChange}>
                  <option value='gcash'>GCASH</option>
                  <option value='paypal'>PayPal</option>
                  <option value='smartpadala'>Smart Padala</option>
                </select>
              </div>
              </div>
              <div className='row mb-3'>
              <div className='col-sm-3'>
              {this.showInput()}
              </div>
              </div>
              <div className='row'>
              <div className='col'>
              <button className='btn btn-primary'>Request Check Out</button>
              </div>
              </div> */}
              <br/>
              
              <TextField
          
          select
          label="Select"
          name='modeOfPayment'
          value={this.state.modeOfPayment}
          onChange={this.handleOnChange}
          helperText="Please select your currency"
          variant="outlined"
          
        >
          {modeOfPayment.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <br/><br/>
        {this.showInput()}
        <br/><br/>
        <Button type='submit' color='primary' variant='contained'>Request Check Out</Button>
              </form>
          )}
              
              <p>
              <strong>Important:</strong> You can checkout the funds raised by your campaign in this page.<br/>
              Your campaign will unable to gather more funds if you check out now.
              </p>
           
              </Grid>
            </Grid>
           
          </main>
        </>
      );
    }
  }else{
    return(
      <NotFound/>
    )
  }
    
  }}
  
  </LoggedInContext.Consumer>
    )
    
  }
}

export default withStyles(useStyles)(CheckOut);
