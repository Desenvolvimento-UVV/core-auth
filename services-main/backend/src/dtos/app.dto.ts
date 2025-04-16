import { IsNotEmpty, Length } from 'class-validator'

export class Report {
    @IsNotEmpty({ message: 'The unique must not be empty.' })
    @Length(6, 64, { message: 'The unique must be 6-64 characters long.' })
    unique: String

    @IsNotEmpty({ message: 'The type must not be empty.' })
    type: String

    @IsNotEmpty({ message: 'The description must not be empty.' })
    @Length(1, 1024, { message: 'The description must be 1-1024 characters long.' })
    description: String
}

export class Status {
    @IsNotEmpty({ message: 'The unique must not be empty.' })
    @Length(6, 64, { message: 'The unique must be 6-64 characters long.' })
    unique: String
}
