import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dtos/createUser.dto';
import { UserEntity } from './entities/user.entity';
import { hash } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

    constructor
    (
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}


    async createUser( createUserDto: CreateUserDto): Promise<UserEntity>{
        const user = await this.findUserByEmail(createUserDto.email).catch(() => undefined)

        if(user)
            {
                throw new BadRequestException('Email registered in system.')
            }


        const saltOrRounds = 10;
        const passwordHashed = await hash(createUserDto.password, saltOrRounds);

        console.log('passwordHashed', passwordHashed);

        return this.userRepository.save({
            ...createUserDto,
            typeUser: 1,
            password: passwordHashed
        })

 
    }

    async getAllUsers(): Promise<UserEntity[]> {
        return this.userRepository.find();
    }


    async getUserByIdUsingRelations(userId: number): Promise<UserEntity> {
        return this.userRepository.findOne({
            where: {
                id: userId
            },
            relations: {
                addresses: {
                    city: {
                        state: true
                    }
                }
            }
        })
    }


    async findUserById(userId: number): Promise<UserEntity> {
        const user = await this.userRepository.findOne({
            where: {
                id: userId
            }
        });

        if(!user){
            throw new NotFoundException(`UserId: ${userId} is not found.`)
        }
         
        return user;

        }



        async findUserByEmail(email: string): Promise<UserEntity> {
            const user = await this.userRepository.findOne({
                where: {
                    email,
                }
            });
    
            if(!user){
                throw new NotFoundException(`Email: ${email} is not found.`)
            }
             
            return user;
    
            }

}
