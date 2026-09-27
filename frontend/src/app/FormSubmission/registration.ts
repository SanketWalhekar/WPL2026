import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Registration {

  // private apiUrl = 'http://localhost:5000/api/registrations';

  // private baseUrl = 'http://localhost:5000/api';

  private apiUrl = '/api/registrations';

private baseUrl = '/api';

  constructor(
    private http: HttpClient
  ) {}

  saveRegistration(formData: FormData): Observable<any> {

    return this.http.post<any>(
      this.apiUrl,
      formData
    );

  }

  // GET ALL REGISTRATIONS
  getRegistrations(): Observable<any> {
    return this.http.get(this.apiUrl);
  }


  // ==================================================
// GET PLAYERS FOR CATEGORY
// ==================================================

getCategoryPlayers() {

  return this.http.get<any>(
    `${this.baseUrl}/categories/players`
  );

}


// ==================================================
// SAVE CATEGORY
// ==================================================

saveCategory(
  categoryData: any
) {

  return this.http.post<any>(

    `${this.baseUrl}/categories`,

    categoryData

  );

}


// ==================================================
// GET ALL CATEGORIES
// ==================================================

getCategories() {

  return this.http.get<any>(

    `${this.baseUrl}/categories`

  );

}


// ==================================================
// GET CATEGORY BY ID
// ==================================================

getCategoryById(
  categoryId: string
) {

  return this.http.get<any>(

    `${this.baseUrl}/categories/${categoryId}`

  );

}


// ==================================================
// DELETE CATEGORY
// ==================================================

deleteCategory(
  categoryId: string
) {

  return this.http.delete<any>(

    `${this.baseUrl}/categories/${categoryId}`

  );

}

// ==================================================
// UPDATE CATEGORY
// ==================================================

updateCategory(
  categoryId: string,
  categoryData: any
) {

  return this.http.put<any>(

    `${this.baseUrl}/categories/${categoryId}`,

    categoryData

  );

}

addAuctionTeam(data: any) {
  return this.http.post<any>(
    `${this.baseUrl}/auction/teams`,
    data
  );
}

getAuctionTeams() {
  return this.http.get<any>(
    `${this.baseUrl}/auction/teams`
  );
}

saveAuctionSettings(data: any) {
  return this.http.post<any>(
    `${this.baseUrl}/auction/settings`,
    data
  );
}

initializeAuctionPlayers() {
  return this.http.post<any>(
    `${this.baseUrl}/auction/initialize-players`,
    {}
  );
}

getAuctionCategories() {
  return this.http.get<any>(
    `${this.baseUrl}/auction/categories`
  );
}

getAuctionCategoryPlayers(categoryId: string) {
  return this.http.get<any>(
    `${this.baseUrl}/auction/categories/${categoryId}/players`
  );
}

sellAuctionPlayer(data: any) {
  return this.http.post<any>(
    `${this.baseUrl}/auction/sell-player`,
    data
  );
}

getAuctionTeamReview() {
  return this.http.get<any>(
    `${this.baseUrl}/auction/team-review`
  );
}

}