import React, { Component } from 'react';
import { connect } from 'react-redux';
import './TypeAheadChoices.css';
import { getShortIdentifierFromRefName, collectionItemsToSingularTitlecased } from '../../utils/parse-data';
import { getChoices } from '../../actions/typeahead-choices-actions';
import { history } from '../../store';

const mapStateToProps = state => ({
	choices: state.typeAheadChoices.data,
	choicesCollectionItems: state.typeAheadChoices.collectionItems
});

const mapDispatchToProps = dispatch => ({
	getChoices: (collectionItems, choiceText) =>
		dispatch(getChoices(collectionItems, choiceText))
});

class TypeAheadChoices extends Component {
	constructor(props) {
		super(props);
		this.updateDebounced = null;
	}

	state = {
		searchText: ''
	}

	componentDidUpdate(prevProps) {
		if (this.updateDebounced) {
			clearTimeout(this.updateDebounced);
		}

		this.updateDebounced = setTimeout(() => {
			if (prevProps.searchText === this.props.searchText) return;
			// Execute search
			this.props.getChoices(
				this.props.collectionItems,
				this.props.searchText
			);
		}, 250);
	}

	componentWillUnmount() {
		if (this.updateDebounced) {
			clearTimeout(this.updateDebounced);
		}
	}

	shouldComponentUpdate(nextProps) {
		return nextProps.searchText ?
			nextProps.searchText.trim() !== this.state.searchText.trim() : false;
	}

    /**
     Matches typed text with characters in title for underline display.
     @returns Object {
		start: "...",
		match: "...",
		end: "..."
	  }
     */
    matchTitleChars(choice) {
        let searchText = this.props.searchText;
        let title = choice.termDisplayName;
        let start = title.toLowerCase().indexOf(searchText.toLowerCase());
        let end = start + searchText.length;
        return {
            start: title.slice(0, start),
            match: title.slice(start, end),
            end: title.slice(end, title.length)
        }
    }

	render() {
		const { numChoices, collectionItems, choices } = this.props;
		return (choices || [])
			.slice(0, numChoices)
			.map((choice, i) => {
            	const splitTitle = this.matchTitleChars(choice);
				return (
					<li
						className="typeAheadChoice d-flex"
						key={i}
						title={choice.termDisplayName}
						onClick={(e) => {
							e.stopPropagation();
							const path = `/collection/${choice.collectionItems}/${getShortIdentifierFromRefName(choice.refName)}`;
							history.push(path);
						}}
					>
						<span className="value">
							{splitTitle.start}
							<span className="match">
								{splitTitle.match}
							</span>
							{splitTitle.end}
						</span>
						<label className="ml-auto">{collectionItemsToSingularTitlecased(collectionItems || choice.collectionItems)}
						</label>
					</li>
				);
		})
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TypeAheadChoices);
