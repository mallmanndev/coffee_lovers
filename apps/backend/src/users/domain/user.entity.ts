export class User {
  private constructor(
    private readonly id: string | null,
    private readonly name: string,
    private readonly email: string,
    private readonly passwordHash: string,
    private readonly city: string,
    private readonly state: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  static create(props: {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    city: string;
    state: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    return new User(
      props.id || null,
      props.name,
      props.email.toLowerCase().trim(),
      props.passwordHash,
      props.city,
      props.state,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  getId(): string | null {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getCity(): string {
    return this.city;
  }

  getState(): string {
    return this.state;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
