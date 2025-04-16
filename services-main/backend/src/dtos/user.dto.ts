import { IsNotEmpty, Length, IsObject, ValidateNested, IsNotEmptyObject } from 'class-validator'
import { Type, Transform } from 'class-transformer'

class Hardware {
  @IsNotEmpty({ message: 'The hardware must not be empty. (1)' })
  cpu: string

  @IsNotEmpty({ message: 'The hardware must not be empty. (2)' })
  gpu: string

  @IsNotEmpty({ message: 'The hardware must not be empty. (3)' })
  ram: string

  @IsNotEmpty({ message: 'The hardware must not be empty. (4)' })
  unique: string
}

export class CreateUser {
  @IsNotEmpty({ message: 'The username must not be empty.' })
  @Length(3, 16, { message: 'The username must be 3-16 characters long.' })
  @Transform(({ value }) => value.toLowerCase())
  username: string

  @IsNotEmpty({ message: 'The password must not be empty.' })
  @Length(6, 64, { message: 'The password must be 6-64 characters long.' })
  password: string

  @IsNotEmpty({ message: 'The product key must not be empty.' })
  productKey: string

  @IsObject()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => Hardware)
  hardware: Hardware
}

export class LoginUser {
  @IsNotEmpty({ message: 'The username must not be empty.' })
  @Length(3, 16, { message: 'The username must be 3-16 characters long.' })
  @Transform(({ value }) => value.toLowerCase())
  username: string

  @IsNotEmpty({ message: 'The password must not be empty.' })
  @Length(6, 64, { message: 'The password must be 6-64 characters long.' })
  password: string

  @IsObject()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => Hardware)
  hardware: Hardware
}