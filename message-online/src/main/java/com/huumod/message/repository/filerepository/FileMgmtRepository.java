package com.huumod.message.repository.filerepository;

import com.huumod.message.entity.file.File;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileMgmtRepository extends MongoRepository<File, String> {
}
