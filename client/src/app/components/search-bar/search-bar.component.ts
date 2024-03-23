import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
    @Output() searchChange = new EventEmitter<string | null>();
    search = faSearch;
    searchForm = new FormGroup({
        search: new FormControl(''),
    });

    onSearch() {
        this.searchChange.emit(this.searchForm.value.search);
    }
}
