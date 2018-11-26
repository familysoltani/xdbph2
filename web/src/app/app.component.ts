import {Component, OnInit} from '@angular/core';
import {UserService} from "./user.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UserService]
})
export class AppComponent implements OnInit{
  register;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.register = {
      username: '',
      password: '',
      email: ''
    };
  }

  registerUser() {
    this.userService.register(this.register).subscribe(
      resp => console.log(resp),
      error => console.log(error)
    )
  }
}
