import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import axios from "axios";
import { useState, useReducer, useEffect } from "react";

const date = new Date();

let dd = String(date.getDate()).padStart(2, '0');
let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
let yyyy = date.getFullYear();
const today = yyyy + '-' + mm + '-' + dd;

const jours = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
const mois = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Decembre"];

const initialEvent = {
	titre: "",
	commentaire: "",
	date_rdv: ""
}

function eventReducer(state, action) {
	switch (action.type) {
		case "titre":
			return { ...state, titre: action.payload };
		case "commentaire":
			return { ...state, commentaire: action.payload };
		case "date_rdv":
			return { ...state, date_rdv: action.payload };
		default:
			return state;
	}
}

function App() {

	//==========================================================================
	//																STATES
	//==========================================================================

	const [events, setEvents] = useState([]);
	const [anneeActuelle, setAnneeActuelle] = useState(date.getFullYear());
	const [moisActuel, setMoisActuel] = useState(date.getMonth());
	const [tab, setTab] = useState([]);
	const [jourDebutMois, setJourDebutMois] = useState(
		new Date(date.getFullYear(), date.getMonth(), 1).getDay()
	);
	const [nbJoursMois, setnbJoursMois] = useState(
		new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
	);

	const [jourSelect, setJourSelect] = useState(today);

	const [event, dispatch] = useReducer(eventReducer, initialEvent)


	//==========================================================================
	//															FUNCTIONS
	//==========================================================================



	const changeYear = (value) => {
		let annee = anneeActuelle + value;
		setAnneeActuelle(annee);
	};

	const changeMois = (value) => {
		let mois = moisActuel + value;
		if (mois === -1) {
			mois = 11;
			changeYear(-1);
		} else if (mois === 12) {
			mois = 0;
			changeYear(1);
		}
		setMoisActuel(mois);
	};

	const select = (id) => {
		setJourSelect(id);
		// document.getElementsByTagName("td").classList.remove("border-start border-end border-dark");
		// document.getElementById(id).classList.remove("border-start border-end border-dark");
	};


	const onSubmit = (e) => {
		e.preventDefault();
		const data = {
			id: "",
			titre: event.titre,
			commentaire: event.commentaire,
			date_rdv: event.date_rdv
		}
		axios.post("http://localhost:3002/events", data);
	}

	//==========================================================================
	//															USE EFFECT
	//==========================================================================

	useEffect(() => {
		let i = new Date(anneeActuelle, moisActuel, 1).getDay();
		setJourDebutMois(i);
		let j = new Date(anneeActuelle, moisActuel + 1, 0).getDate();
		setnbJoursMois(j);

		axios.get("http://localhost:3002/events").then(({ data }) => {
			setEvents(data);
		});
	}, [anneeActuelle, moisActuel])

	useEffect(() => {

		const tmp = [];
		const res = [];

		let jourNb = 1;
		for (let i = 0; i < 35; i++) {
			if (i < 7 && jourDebutMois !== 0) {
				if (i >= jourDebutMois - 1) {
					tmp[i] = {
						nb: jourNb, date: anneeActuelle + "-" + ("0" + (moisActuel + 1)).slice(-2) + "-" + ("0" + jourNb).slice(-2)
					};
					jourNb++;
				}
				else {
					tmp[i] = null;
				}
			}
			else if (i < 7 && jourDebutMois === 0) {
				if (i < 6) tmp[i] = null;
				else {
					tmp[i] = {
						nb: jourNb, date: anneeActuelle + "-" + ("0" + (moisActuel + 1)).slice(-2) + "-" + ("0" + jourNb).slice(-2)
					};
					jourNb++;
				}
			}
			else if (i >= 7 && jourNb <= nbJoursMois) {
				tmp[i] = {
					nb: jourNb, date: anneeActuelle + "-" + ("0" + (moisActuel + 1)).slice(-2) + "-" + ("0" + jourNb).slice(-2)
				};
				jourNb++;
			}
			else tmp[i] = null;
		}

		let j = 0;
		let l = 0;
		tmp.forEach((date) => {
			if (j === 7) {
				l++;
				j = 0;
			}
			if (j === 0) res[l] = [];
			if (j < 7) {
				res[l].push(date);
				j++;
			}
		});

		setTab(res);
	}, [jourDebutMois, nbJoursMois]);

	//==========================================================================
	//==========================================================================
	//==========================================================================

	return (
		<div className="container">
			<div className="row">
				<h1 className="text-center">Calendrier</h1>
			</div>
			<div className="row">
				<div className="col-md-6" align="center">
					<div className="d-flex justify-content-center align-items-center">
						<button className="btn btn-sm btn-outline-dark" onClick={() => changeYear(-1)}> &lsaquo;&lsaquo; </button>
						<div className="select-calendar">&nbsp; {anneeActuelle} &nbsp;</div>
						<button className="btn btn-sm btn-outline-dark" onClick={() => changeYear(1)}> &rsaquo;&rsaquo; </button>
					</div>

					<div className="d-flex justify-content-center align-items-center mt-2">
						<button className="btn btn-sm btn-outline-dark" onClick={() => changeMois(-1)}> &lsaquo;&lsaquo; </button>
						<div className="select-calendar">&nbsp; {mois[moisActuel]} &nbsp;</div>
						<button className="btn btn-sm btn-outline-dark" onClick={() => changeMois(1)}> &rsaquo;&rsaquo; </button>
					</div>

					<div className="row justify-content-center mt-3">
						<table className="table">
							<thead>
								<tr align="center">
									{jours.map((jour, i) => (
										<th key={i}>{jour}</th>
									))}
								</tr>
							</thead>
							<tbody>
								{tab.map((data) => {
									let ligne = data.map((date) => {
										if (date) {
											let className = (jourSelect == date.date) ? 'border-start border-end border-bottom-0 border-dark' : '';
											if (date.date === today) {
												className += ' text-danger font-weight-bold';
											}
											if (events.filter(event => event.date_rdv == date.date).length > 0) {
												className += ' table-info';
											}
											return (
												<td align="center" className={className} onClick={() => select(date.date)} id={date.date}>{date.nb}</td>
											);
										}
										else return (
											<td></td>
										);
									})
									return (
										<tr>{ligne}</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				</div>

				<div className="col-md-6">

					<h2 className="my-3">Ajout d'un rendez-vous</h2>
					<form onSubmit={onSubmit}>
						<input type="text" placeholder="Titre" className="form-control mb-1" onChange={(e) => dispatch({ type: "titre", payload: e.target.value })} />
						<input type="text" placeholder="Commentaire" className="form-control mb-1" onChange={(e) => dispatch({ type: "commentaire", payload: e.target.value })} />
						<input type="date" className="form-control mb-1" onChange={(e) => dispatch({ type: "date_rdv", payload: e.target.value })} />
						<button className="btn btn-success">Enregistrer</button>
					</form>

					<hr className="my-5" />

					<div>
						{events.filter(event => event.date_rdv == jourSelect).map((event) => {
							return (
								<div>
									<h3>{event.titre}</h3>
									<p>{event.commentaire}</p>
								</div>
							)
						})}
					</div>
				</div>

			</div >
		</div >
	);
}

export default App;
