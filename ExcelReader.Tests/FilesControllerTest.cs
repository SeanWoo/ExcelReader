using ExcelReader.Controllers;
using System;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using ExcelReader.Data;
using ExcelReader.Entities;
using System.Linq;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace ExcelReader.Tests
{
    public class FilesControllerTest
    {
        private DbContextOptions<ApplicationDbContext> _options;

        public FilesControllerTest()
        {
            _options = GetDbContextOptions();

            using (var context = new ApplicationDbContext(_options))
            {
                context.Files.Add(new FileEntity { FileName = "test1.csv", Data = Convert.ToBase64String(Encoding.Default.GetBytes("1 data not base 64")) });
                context.Files.Add(new FileEntity { FileName = "test2.csv", Data = Convert.ToBase64String(Encoding.Default.GetBytes("2 data not base 64")) });
                context.Files.Add(new FileEntity { FileName = "test3.csv", Data = Convert.ToBase64String(Encoding.Default.GetBytes("3 data not base 64")) });
                context.Files.Add(new FileEntity { FileName = "test11.csv", Data = Convert.ToBase64String(Encoding.Default.GetBytes("11 data not base 64")) });
                context.Files.Add(new FileEntity { FileName = "test22.csv", Data = Convert.ToBase64String(Encoding.Default.GetBytes("22 data not base 64")) });
                context.Files.Add(new FileEntity { FileName = "test33.csv", Data = Convert.ToBase64String(Encoding.Default.GetBytes("33 data not base 64")) });
                context.SaveChanges();
            }
        }

        [Fact]
        public async void GetAll_NotEmpty()
        {
            using (var context = new ApplicationDbContext(_options))
            {
                var controller = new FilesController(context);

                var result = await controller.GetAll();

                Assert.NotEmpty(result);
            }
        }

        [Theory]
        [InlineData("test4.csv", "i new file!")]
        [InlineData("test5.csv", "i new file 2!")]
        public async void Append_File_OK(string nameFile, string dataFile)
        {
            using (var context = new ApplicationDbContext(_options))
            {
                var controller = new FilesController(context);

                var file = CreateTestFormFile(nameFile, dataFile);

                var result = await controller.AppendFile(file) as OkResult;

                Assert.NotNull(result);
                Assert.Equal(200, result.StatusCode);
            }
        }

        [Theory]
        [InlineData("test6.csv", "i new file!")]
        [InlineData("test7.csv", "i new file 2!")]
        public async void AppendAndCheck_File_Equals(string nameFile, string dataFile)
        {
            using (var context = new ApplicationDbContext(_options))
            {
                var controller = new FilesController(context);

                var file = CreateTestFormFile(nameFile, dataFile);

                var result = await controller.AppendFile(file) as OkResult;

                Assert.NotNull(result);
                Assert.Equal(200, result.StatusCode);



                var fileContent = await controller.GetByNameFile(nameFile) as FileContentResult;
                Assert.NotNull(fileContent);

                var data = Encoding.Default.GetString(fileContent.FileContents);
                Assert.Equal(dataFile, data);
            }
        }

        [Theory]
        [InlineData("test11.csv", "11 data not base 64")]
        [InlineData("test22.csv", "22 data not base 64")]
        [InlineData("test33.csv", "33 data not base 64")]
        public async void GetByNameFile_FileName_Equals(string nameFile, string dataFile)
        {
            using (var context = new ApplicationDbContext(_options))
            {
                var controller = new FilesController(context);

                var result = await controller.GetByNameFile(nameFile) as FileContentResult;

                Assert.NotNull(result);

                var data = Encoding.Default.GetString(result.FileContents);

                Assert.Equal(dataFile, data);
            }
        }

        [Theory]
        [InlineData("test1.csv", "i was updated!")]
        [InlineData("test2.csv", "i was updated!")]
        [InlineData("test3.csv", "i was updated!")]
        public async void Update_File_OK(string nameFile, string dataFile)
        {
            using (var context = new ApplicationDbContext(_options))
            {
                var controller = new FilesController(context);

                var file = CreateTestFormFile(nameFile, dataFile);

                var result = await controller.UpdateFile(file) as OkResult;

                Assert.NotNull(result);
                Assert.Equal(200, result.StatusCode);
            }
        }

        [Theory]
        [InlineData("test1.csv", "i was updated!")]
        [InlineData("test2.csv", "i was updated!")]
        [InlineData("test3.csv", "i was updated!")]
        public async void UpdateAndCheck_File_Equals(string nameFile, string dataFile)
        {
            using (var context = new ApplicationDbContext(_options))
            {
                var controller = new FilesController(context);

                var file = CreateTestFormFile(nameFile, dataFile);

                var result = await controller.UpdateFile(file) as OkResult;

                Assert.NotNull(result);
                Assert.Equal(200, result.StatusCode);



                var fileContent = await controller.GetByNameFile(nameFile) as FileContentResult;
                Assert.NotNull(fileContent);

                var data = Encoding.Default.GetString(fileContent.FileContents);
                Assert.Equal(dataFile, data);
            }
        }

        private IFormFile CreateTestFormFile(string name, string content)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(content);

            return new FormFile(
                baseStream: new MemoryStream(bytes),
                baseStreamOffset: 0,
                length: bytes.Length,
                name: "file",
                fileName: name
            );
        }

        private DbContextOptions<ApplicationDbContext> GetDbContextOptions()
        {
            return new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase("FilesTest")
                .Options;
        }
    }
}
