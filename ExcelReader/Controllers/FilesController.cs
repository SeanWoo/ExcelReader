using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System.Linq;
using Microsoft.AspNetCore.Http;
using ExcelReader.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using ExcelReader.Entities;
using System;
using System.IO;
using System.Collections.Generic;
using ExcelReader.Models;

namespace ExcelReader.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FilesController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ApplicationDbContext _context;

        public FilesController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Получение всех файлов
        /// </summary>
        /// <returns>Файл с content-type: text/csv</returns>
        [HttpGet]
        public async Task<IEnumerable<FileModel>> GetAll()
        {
            var result = await _context.Files.AsNoTracking().Select(x => new FileModel()
            {
                Id = x.Id,
                FileName = x.FileName
            }).ToListAsync();

            return result;
        }
        
        /// <summary>
        /// Получение файла из папки с нашим контентом
        /// </summary>
        /// <param name="nameFile">Имя файла с расширением</param>
        /// <returns>Файл с content-type: text/csv</returns>
        /// <response code="200">Возрат если файл успешно обновлён</response>
        /// <response code="404">Возрат если не удалось найти указанный файл</response>
        [HttpGet("{nameFile}")]
        public async Task<IActionResult> GetByNameFile(string nameFile)
        {
            var result = await _context.Files.FirstOrDefaultAsync(x => x.FileName == nameFile);
            if (result is null)
            {
                return NotFound();
            }
            var data = Convert.FromBase64String(result.Data);
            return File(data, "text/csv");
        }

        /// <summary>
        /// Обновление файла
        /// </summary>
        /// <returns>Ничего не возращает</returns>
        /// <response code="200">Возрат если файл успешно обновлён</response>
        /// <response code="400">Возрат если не верно составлен запрос</response>
        /// <response code="404">Возрат если не удалось найти указанный файл</response>
        [HttpPost]
        public async Task<IActionResult> UpdateFile(IFormFile file)
        {
            if(file is null)
                return BadRequest();
            

            using var ms = new MemoryStream();

            await file.CopyToAsync(ms);
            var dataInBase64 = Convert.ToBase64String(ms.ToArray());

            var result = await _context.Files.FirstOrDefaultAsync(x => x.FileName == file.FileName);
            
            if (result is null)
            {
                return NotFound();
            }

            result.Data = dataInBase64;
            await _context.SaveChangesAsync();

            return Ok();
        }

        /// <summary>
        /// Добавление файла
        /// </summary>
        /// <returns></returns>
        /// <response code="200">Возрат если файл успешно добавлен</response>
        /// <response code="400">Возрат если такой файл уже существует или не верно составлен запрос</response>
        [HttpPut]
        public async Task<IActionResult> AppendFile(IFormFile file)
        {
            if (file is null)
                return BadRequest();

            var result = await _context.Files.AnyAsync(x => x.FileName == file.FileName);

            if (result)
                return BadRequest();

            using var ms = new MemoryStream();

            await file.CopyToAsync(ms);
            var dataInBase64 = Convert.ToBase64String(ms.ToArray());

            var model = new FileEntity()
            {
                FileName = file.FileName,
                Data = dataInBase64
            };

            await _context.Files.AddAsync(model);

            await _context.SaveChangesAsync();

            return Ok();

        }
    }
}
