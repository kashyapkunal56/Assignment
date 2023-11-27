import { LightningElement } from 'lwc';
import fetchResult from '@salesforce/apex/HolidayCalendar.fetchAPI';
export default class SearchComponent extends LightningElement {
    searchValue = '';
    dateOfBirth;
    gender;
    citizen;
    year;
    showTable = false;
    tableData = [];
    pageMessages = [];
    showMessages = false;
    buttonState = true;
    showHolidayTable = false;
    instruction = 'This page shows you the holiday list on your date of birth'
    Columns = [
        { label: 'Date', fieldName: 'date' },
        { label: 'Name', fieldName: 'name' },
        { label: 'Type', fieldName: 'type' },
        { label: 'Description', fieldName: 'description' }
    ];

    searchKeyword(event) {
        this.searchValue = event.target.value;
        if (this.searchValue !== '' && this.searchValue.length == 13) {
            // get first 6 digits as a valid date
            var tempDate = new Date(this.searchValue.substring(0, 2), this.searchValue.substring(2, 4) - 1, this.searchValue.substring(4, 6));

            var date = tempDate.getDate();
            var month = tempDate.getMonth();
            var year = tempDate.getFullYear();

            if (year < (new Date()).getFullYear() - 100) {
                year += 100
            }
            this.year = year;

            var fullDate = year + "-" + (month + 1) + "-" + date;
            this.dateOfBirth = fullDate;

            var genderCode = this.searchValue.substring(6, 10);
            var gender = parseInt(genderCode) < 5000 ? "Female" : "Male";
            this.gender = gender;

            var citzenship = parseInt(this.searchValue.substring(10, 11)) == 0 ? "Yes" : "No";
            this.citizen = citzenship;

            // apply Luhn formula for check-digits
            var tempTotal = 0;
            var checkSum = 0;
            var multiplier = 1;
            for (var i = 0; i < 13; ++i) {
                tempTotal = parseInt(this.searchValue.charAt(i)) * multiplier;
                if (tempTotal > 9) {
                    tempTotal = parseInt(tempTotal.toString().charAt(0)) + parseInt(tempTotal.toString().charAt(1));
                }
                checkSum = checkSum + tempTotal;
                multiplier = (multiplier % 2 == 0) ? 1 : 2;
            }
            if ((checkSum % 10) != 0) {
                this.pageMessages = ['ID number does not appear to be authentic'];
                this.showMessages = true;
                this.tableData = [];
                this.showTable = false;
                this.buttonState = true;
                this.showHolidayTable = false;
            }
            else {
                this.buttonState = false
                this.showMessages = false;
                this.showTable = true;
                this.pageMessages = [];
                this.showHolidayTable = false;

            }

        }
        else {
            this.showMessages = false;
            this.tableData = [];
            this.showTable = false;
            this.buttonState = true;
            this.pageMessages = [];
            this.showHolidayTable = false;
        }

    }

    handleSearchKeyword() {

        fetchResult({ year: this.year, dob: this.dateOfBirth, gender: this.gender, citizen: this.citizen, SAId: this.searchValue })
            .then(result => {
                var data = [];
                for (const key in result) {
                    data = [...data, { date: result[key].date.iso, description: result[key].description, type: result[key].primary_type, name: result[key].name }];
                }
                this.tableData = data;
                this.showHolidayTable = true;
            })
            .catch(error => {
            });


    }

    handleMessageCloseClick(event) {
        this.showMessages = false;
        this.pageMessages = [];

    }
}