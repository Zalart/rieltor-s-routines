import React, { Component } from 'react'

import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import CardContent from '@material-ui/core/CardContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { authMiddleWare } from '../util/auth';
import FileUploader from './FIleUploader';


const styles = ((theme) => ({
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    toolbar: theme.mixins.toolbar,
    title: {
		marginLeft: theme.spacing(2),
		flex: 1
	},
	submitButton: {
		display: 'block',
		color: 'white',
		textAlign: 'center',
		position: 'absolute',
		top: 14,
		right: 10
	},
	floatingButton: {
		position: 'fixed',
		bottom: 0,
		right: 0
	},
	form: {
		width: '98%',
		marginLeft: 13,
		marginTop: theme.spacing(10)
	},
	root: {
		minWidth: 470
	},
	bullet: {
		display: 'inline-block',
		margin: '0 2px',
		transform: 'scale(0.8)'
	},
	pos: {
		marginBottom: 12
	},
	uiProgess: {
		position: 'fixed',
		zIndex: '1000',
		height: '31px',
		width: '31px',
		left: '50%',
		top: '35%'
	},
	dialogeStyle: {
		maxWidth: '50%'
	},
	viewRoot: {
		margin: 0,
		padding: theme.spacing(2)
	},
	closeButton: {
		position: 'absolute',
		right: theme.spacing(1),
		top: theme.spacing(1),
		color: theme.palette.grey[500]
	}
    })
);

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

class object extends Component {
	constructor(props) {
		super(props);

		this.state = {
			objects: '',
			title: '',
			body: '',
			objectId: '',
			errors: [],
			files: [],
			imagesUrls: [],
			open: false,
			uiLoading: true,
			buttonType: '',
			viewOpen: false
		};

		this.deleteObjectHandler = this.deleteObjectHandler.bind(this);
		this.handleEditClickOpen = this.handleEditClickOpen.bind(this);
		this.handleViewOpen = this.handleViewOpen.bind(this);
		this.handleSetFiles = this.handleSetFiles.bind(this);
	}

	handleChange = (event) => {
		this.setState({
			[event.target.name]: event.target.value
		});
	};

	componentWillMount = () => {
		authMiddleWare(this.props.history);
		const authToken = localStorage.getItem('AuthToken');
		axios.defaults.headers.common = { Authorization: `${authToken}` };
		axios
			.get('/objects')
			.then((response) => {
				this.setState({
					objects: response.data,
					uiLoading: false
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};

	deleteObjectHandler(data) {
		authMiddleWare(this.props.history);
		const authToken = localStorage.getItem('AuthToken');
		axios.defaults.headers.common = { Authorization: `${authToken}` };
		let objectId = data.object.objectId;
		axios
			.delete(`object/${objectId}`)
			.then(() => {
				window.location.reload();
			})
			.catch((err) => {
				console.log(err);
			});
	}

	handleImageChange = (event) => {
		this.setState({
			image: event.target.files[0]
		});
	};

	 objectPictureHandler = (event) => {
		event.preventDefault();
		this.setState({
			uiLoading: true
		});

		authMiddleWare(this.props.history);
		const authToken = localStorage.getItem('AuthToken');
		let form_data = new FormData();
		form_data.append('image', this.state.image);
		form_data.append('content', this.state.content);
		axios.defaults.headers.common = { Authorization: `${authToken}` };
		axios
			.post(`http://localhost:5000/realtor-s-routines/us-central1/api/object/${this.state.objectId}/images`, form_data, {
				headers: {
					'content-type': 'multipart/form-data'
				}
			})
			.then(() => {
				window.location.reload();
			})
			.catch((error) => {
				if (error.response.status === 403) {
					this.props.history.push('/login');
				}
				console.log(error);
				this.setState({
					uiLoading: false,
					imageError: 'Error in posting the data'
				});
			});
	}; 


	handleEditClickOpen(data) {
		this.setState({
			title: data.object.title,
			body: data.object.body,
			objectId: data.object.objectId,
			buttonType: 'Edit',
			open: true
		});
	}

	handleViewOpen(data) {
		this.setState({
			title: data.object.title,
			body: data.object.body,
			viewOpen: true
		});
	}
	handleSetFiles(data) {
		this.setState({
			files: data,
			imagesUrls: data.map((file)=>file.serverId)
		})
	}

	render() {
		const DialogTitle = withStyles(styles)((props) => {
			const { children, classes, onClose, ...other } = props;
			return (
				<MuiDialogTitle disableTypography className={classes.root} {...other}>
					<Typography variant="h6">{children}</Typography>
					{onClose ? (
						<IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
							<CloseIcon />
						</IconButton>
					) : null}
				</MuiDialogTitle>
			);
		});

		const DialogContent = withStyles((theme) => ({
			viewRoot: {
				padding: theme.spacing(2)
			}
		}))(MuiDialogContent);

		dayjs.extend(relativeTime);
		const { classes } = this.props;
		const { open, errors, viewOpen } = this.state;

		const handleClickOpen = () => {
			this.setState({
				objectId: '',
				title: '',
				body: '',
				buttonType: '',
				open: true
			});
		};

		const handleSubmit = (event) => {
			authMiddleWare(this.props.history);
			event.preventDefault();
			const userObject = {
				title: this.state.title,
				body: this.state.body,
				imagesUrls: this.state.imagesUrls

			};
			let options = {};
			if (this.state.buttonType === 'Edit') {
				options = {
					url: `/object/${this.state.objectId}`,
					method: 'put',
					data: userObject
				};
			} else {
				options = {
					url: '/object',
					method: 'post',
					data: userObject
				};
			}
			const authToken = localStorage.getItem('AuthToken');
			axios.defaults.headers.common = { Authorization: `${authToken}` };
			axios(options)
				.then(() => {
					this.setState({ open: false });
					window.location.reload();
				})
				.catch((error) => {
					this.setState({ open: true, errors: error.response.data });
					console.log(error);
				});
		};

		const handleViewClose = () => {
			this.setState({ viewOpen: false });
		};

		const handleClose = (event) => {
			this.setState({ open: false });
		};

		if (this.state.uiLoading === true) {
			return (
				<main className={classes.content}>
					<div className={classes.toolbar} />
					{this.state.uiLoading && <CircularProgress size={150} className={classes.uiProgess} />}
				</main>
			);
		} else {
			return (
				<main className={classes.content}>
					<div className={classes.toolbar} />

					<IconButton
						className={classes.floatingButton}
						color="primary"
						aria-label="Add Object"
						onClick={handleClickOpen}
					>
						<AddCircleIcon style={{ fontSize: 60 }} />
					</IconButton>
					<Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
						<AppBar className={classes.appBar}>
							<Toolbar>
								<IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
									<CloseIcon />
								</IconButton>
								<Typography variant="h6" className={classes.title}>
									{this.state.buttonType === 'Edit' ? 'Edit Object' : 'Add a new object'}
								</Typography>
								<Button
									autoFocus
									color="inherit"
									onClick={handleSubmit}
									className={classes.submitButton}
								>
									{this.state.buttonType === 'Edit' ? 'Save' : 'Submit'}
								</Button>
							</Toolbar>
						</AppBar>

						<form className={classes.form} noValidate>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<TextField
										variant="outlined"
										required
										fullWidth
										id="objectTitle"
										label="Object Title"
										name="title"
										autoComplete="objectTitle"
										helperText={errors.title}
										value={this.state.title}
										error={errors.title ? true : false}
										onChange={this.handleChange}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										variant="outlined"
										required
										fullWidth
										id="objectDetails"
										label="Object Details"
										name="body"
										autoComplete="objectDetails"
										multiline
										rows={15}
										rowsMax={15}
										helperText={errors.body}
										error={errors.body ? true : false}
										onChange={this.handleChange}
										value={this.state.body}
									/>
								</Grid>
								<Grid item xs={12}>
									<FileUploader objectId = {this.state.objectId} files={this.state.files} handleSetFiles={this.handleSetFiles}/>
							{/* 	<Button
										variant="outlined"
										color="primary"
										type="submit"
										size="small"
										startIcon={<CloudUploadIcon />}
										className={classes.uploadButton}
										onClick={this.objectPictureHandler}
									>
										Upload Photo
									</Button>
									<input type="file" onChange={this.handleImageChange} />*/}
									</Grid> 
									</Grid>
						</form>
					</Dialog>

					<Grid container spacing={2}>
						{this.state.objects.map((object) => (
							<Grid key={object.objectId} item xs={12} sm={6}>
								<Card className={classes.root} variant="outlined">
									<CardContent>
										<Typography variant="h5" component="h2">
											{object.title}
										</Typography>
										<Typography className={classes.pos} color="textSecondary">
											{dayjs(object.createdAt).fromNow()}
										</Typography>
										<Typography variant="body2" component="p">
											{`${object.body.substring(0, 65)}`}
										</Typography>
										
									{/* Нужно вывести фотографии, основываясь на поле imgUrl из  БД, а не state
										{
										this.state.files.length ? this.state.files.map((file)=>(
										
										<img key={file.serverId} src={`https://firebasestorage.googleapis.com/v0/b/objects-media/o/${object.objectId}%2F${file.serverId}?alt=media`} />
									
										)) : null
										} */}

									</CardContent>
									<CardActions>
										<Button size="small" color="primary" onClick={() => this.handleViewOpen({ object })}>
											{' '}
											View{' '}
										</Button>
										<Button size="small" color="primary" onClick={() => this.handleEditClickOpen({ object })}>
											Edit
										</Button>
										<Button size="small" color="primary" onClick={() => this.deleteObjectHandler({ object })}>
											Delete
										</Button>
									</CardActions>
								</Card>
							</Grid>
						))}
					</Grid>

					<Dialog
						onClose={handleViewClose}
						aria-labelledby="customized-dialog-title"
						open={viewOpen}
						fullWidth
						classes={{ paperFullWidth: classes.dialogeStyle }}
					>
						<DialogTitle id="customized-dialog-title" onClose={handleViewClose}>
							{this.state.title}
						</DialogTitle>
						<DialogContent dividers>
							<TextField
								fullWidth
								id="objectDetails"
								name="body"
								multiline
								readonly
								rows={1}
								rowsMax={25}
								value={this.state.body}
								InputProps={{
									disableUnderline: true
								}}
							/>
						</DialogContent>
					</Dialog>
				</main>
			);
		}
	}
}

export default (withStyles(styles)(object));