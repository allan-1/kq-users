import type { Address, Company, Geo, User } from '@/domain/models/user';
import type { UserDto } from '@/data/api/dto/user-dto';

export function mapUser(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    username: dto.username,
    email: dto.email,
    phone: dto.phone,
    website: dto.website,
    address: mapAddress(dto.address),
    company: mapCompany(dto.company),
  };
}

export function mapUsers(dtos: UserDto[]): User[] {
  return dtos.map(mapUser);
}

function mapAddress(dto: UserDto['address']): Address {
  return {
    street: dto.street,
    suite: dto.suite,
    city: dto.city,
    zipcode: dto.zipcode,
    geo: mapGeo(dto.geo),
  };
}

function mapGeo(dto: UserDto['address']['geo']): Geo {
  return { lat: dto.lat, lng: dto.lng };
}

function mapCompany(dto: UserDto['company']): Company {
  return {
    name: dto.name,
    catchPhrase: dto.catchPhrase,
    bs: dto.bs,
  };
}
